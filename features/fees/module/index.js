import { isNumberUnit } from '@exodus/currency'
import assert from 'minimalistic-assert'

function unifyFeeResult(fees) {
  // legacy, it just returns a NU
  if (isNumberUnit(fees)) {
    return { fee: fees }
  }

  if (fees.extraFee) {
    // legacy bitcoin, unify
    return { ...fees, extraFee: undefined, extraFeeData: { extraFee: fees.extraFee } }
  }

  return fees
}

function validateFeeResult({ asset, fees }) {
  assert(
    fees?.fee,
    `asset ${asset.name}, ${asset.baseAsset.name} did not calculate the correct fee, fee field must be resolved.`
  )
  return fees
}

function createFees({
  feeMonitors,
  accountStatesAtom,
  txLogsAtom,
  assetsModule,
  addressProvider,
  walletAccounts,
  logger,
}) {
  return {
    getFees: async ({
      assetName,
      walletAccount,
      fromAddress: providedFromAddress,
      toAddress: providedToAddress,
      ...rest
    }) => {
      const asset = await assetsModule.getAsset(assetName)

      const notLoadedYetDefault = { fee: asset.feeAsset.currency.ZERO }
      const baseAsset = asset.baseAsset
      const feeData = await feeMonitors.getFeeData({ assetName: baseAsset.name })
      if (!feeData) {
        return notLoadedYetDefault
      }

      const walletAccountInstance = walletAccounts.get(walletAccount)

      async function resolveFromAddress() {
        if (providedFromAddress) {
          return providedFromAddress
        }

        const addressObject = await addressProvider.getReceiveAddress({
          assetName: asset.name,
          walletAccount: walletAccountInstance,
          useCache: true,
        })
        return addressObject.toString()
      }

      const fromAddress = await resolveFromAddress()

      const toAddress =
        providedToAddress && asset.baseAsset.address.validate(providedToAddress)
          ? providedToAddress
          : undefined

      if (baseAsset.api?.getFeeAsync) {
        try {
          const fees = await baseAsset.api.getFeeAsync({
            ...rest,
            fromAddress,
            toAddress,
            asset,
            feeData,
            walletAccount,
          })
          return validateFeeResult({ asset, fees })
        } catch (e) {
          logger.error(
            `Cannot load async fees for asset ${assetName}, ${asset.baseAsset.name}. Fallback to sync fees. ${e.message}`,
            e
          )
        }
      }

      // legacy, from when they were selectors
      if (baseAsset.api?.getFee) {
        const { value: txLogs } = await txLogsAtom.get()
        const txLog = txLogs[walletAccount]?.[assetName]
        if (!txLog) {
          return notLoadedYetDefault
        }

        const { value: accountStates } = await accountStatesAtom.get()
        const accountState = accountStates[walletAccount]?.[baseAsset.name]
        if (!accountState) {
          return notLoadedYetDefault
        }

        const fees = unifyFeeResult(
          baseAsset.api.getFee({
            ...rest,
            address: toAddress, // legacy
            fromAddress,
            toAddress,
            asset,
            accountState,
            txSet: txLog,
            feeData,
          })
        )
        return validateFeeResult({ asset, fees })
      }

      if (feeData?.fee) {
        const fees = { fee: feeData.fee }
        return validateFeeResult({ asset, fees })
      }

      return notLoadedYetDefault
    },
  }
}

const feesModuleDefinition = {
  id: 'fees',
  type: 'module',
  factory: createFees,
  dependencies: [
    'feeMonitors',
    'accountStatesAtom',
    'txLogsAtom',
    'assetsModule',
    'addressProvider',
    'walletAccounts',
    'logger',
  ],
  public: true,
}

export default feesModuleDefinition
