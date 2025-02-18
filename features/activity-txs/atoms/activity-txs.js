import { combine, compute } from '@exodus/atoms'
import { createSelector } from 'reselect'
import { createDeepEqualOutputSelector } from '@exodus/core-selectors/utils/deep-equal'
import { memoize } from '@exodus/basic-utils'

const createAssetSourceActivityTxsSelector = memoize(
  ({ assetName, walletAccount }) =>
    createDeepEqualOutputSelector(
      (args) => args.txs,
      (args) => args.activityOptions,
      (args) => args.asset,
      (txs, activityOptions, asset) =>
        asset.api.getActivityTxs({
          txs,
          asset,
          options: activityOptions,
        })
    ),
  ({ assetName, walletAccount }) => `${assetName}_${walletAccount}`
)

const createAssetSourceActivityOptionsSelector = memoize(
  ({ assetName, walletAccount }) =>
    createDeepEqualOutputSelector(
      (args) => args.accountState,
      (args) => args.asset,
      (accountState, asset) =>
        asset.api.getActivityOptions({
          accountState,
        })
    ),
  ({ assetName, walletAccount }) => `${assetName}_${walletAccount}`
)

const createAssetSourceTxsSelector = memoize(
  ({ assetName, walletAccount }) =>
    createSelector(
      (args) => args.txSet,
      (txSet) => {
        return [...txSet]
      }
    ),
  ({ assetName, walletAccount }) => `${assetName}_${walletAccount}`
)

const areActivitiesEqual = (obj1 = {}, obj2 = {}) => {
  // Get wallet account keys from both objects
  const obj1WalletAccounts = Object.keys(obj1)
  const obj2WalletAccounts = Object.keys(obj2)

  // Check if both objects have the same number of wallet accounts
  if (obj1WalletAccounts.length !== obj2WalletAccounts.length) {
    return false
  }

  // Iterate over each wallet account in obj1
  for (const walletAccount of obj1WalletAccounts) {
    // Check if obj2 has the same wallet account
    if (!Object.prototype.hasOwnProperty.call(obj2, walletAccount)) {
      return false
    }

    const obj1Assets = obj1[walletAccount] || {}
    const obj2Assets = obj2[walletAccount] || {}

    const obj1AssetNames = Object.keys(obj1Assets)
    const obj2AssetNames = Object.keys(obj2Assets)

    if (obj1AssetNames.length !== obj2AssetNames.length) {
      return false
    }

    // Iterate over each asset in obj1Assets
    for (const assetName of obj1AssetNames) {
      // Check if obj2Assets has the same asset name and the data matches
      if (
        !Object.prototype.hasOwnProperty.call(obj2Assets, assetName) ||
        obj1Assets[assetName] !== obj2Assets[assetName]
      ) {
        return false
      }
    }
  }

  return true
}

const createActivityTxsAtom = ({
  txLogsAtom,
  accountStatesAtom,
  assetsModule,
  logger,
  errorTracking,
}) => {
  const inputAtom = combine({
    txLogs: txLogsAtom,
    accountStates: accountStatesAtom,
  })

  let prevResult = Object.create(null)

  const selector = async ({ txLogs, accountStates }) => {
    const { value } = txLogs
    const { value: accountStatesValue } = accountStates

    // Process each wallet account asynchronously
    const resultEntries = await Promise.all(
      Object.entries(value).map(async ([walletAccount, accountTxLogs]) => {
        // Process each asset within the wallet account asynchronously
        const assetEntries = await Promise.all(
          Object.entries(accountTxLogs).map(async ([assetName, assetTxSet]) => {
            const asset = assetsModule.getAsset(assetName)
            const baseAssetName = asset.baseAsset.name

            if (asset?.api?.getActivityTxs) {
              let activityOptions

              if (asset?.api?.getActivityOptions) {
                const baseAssetAccountState = accountStatesValue?.[walletAccount]?.[baseAssetName]

                const getOptionsForAssetSource = createAssetSourceActivityOptionsSelector({
                  assetName,
                  walletAccount,
                })

                activityOptions = await getOptionsForAssetSource({
                  accountState: baseAssetAccountState,
                  asset,
                })
              }

              const txs = createAssetSourceTxsSelector({ assetName, walletAccount })({
                txSet: assetTxSet,
              })

              const getActivityForAssetSource = createAssetSourceActivityTxsSelector({
                assetName,
                walletAccount,
              })

              try {
                const activityTxs = await getActivityForAssetSource({
                  asset,
                  txs,
                  activityOptions,
                })

                return [assetName, activityTxs]
              } catch (e) {
                errorTracking.track({ error: e, namespace: 'activityTxs', context: { assetName } })
                logger.warn(`failed to get activity txs for asset: ${assetName}`, e)
                return [assetName, []]
              }
            }

            const txs = createAssetSourceTxsSelector({ assetName, walletAccount })({
              txSet: assetTxSet,
            })

            return [assetName, txs]
          })
        )

        return [walletAccount, Object.fromEntries(assetEntries)]
      })
    )

    const result = Object.fromEntries(resultEntries)

    if (areActivitiesEqual(result, prevResult)) {
      return prevResult
    }

    prevResult = result

    return result
  }

  return compute({
    atom: inputAtom,
    selector,
  })
}

const activityTxsAtomDefinition = {
  id: 'activityTxsAtom',
  type: 'atom',
  factory: createActivityTxsAtom,
  dependencies: ['txLogsAtom', 'accountStatesAtom', 'assetsModule', 'logger', 'errorTracking'],
  public: true,
}

export default activityTxsAtomDefinition
