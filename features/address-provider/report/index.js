import { SafeError } from '@exodus/errors'
import BipPath from 'bip32-path'
import { set, pick, pickBy, memoize } from '@exodus/basic-utils'
import KeyIdentifier from '@exodus/key-identifier'
import convertXpub from 'xpub-converter'
import { z } from '@exodus/zod'
import { WalletAccount } from '@exodus/models'

const lexicographicCompare = (a, b) => String(a).localeCompare(String(b))

const createAddressProviderReport = ({
  assetsModule,
  publicKeyProvider,
  enabledWalletAccountsAtom,
  availableAssetNamesByWalletAccountAtom,
  addressProvider,
  accountStatesAtom,
}) => ({
  namespace: 'addressProvider',
  export: async ({ walletExists, isLocked } = Object.create(null)) => {
    if (!walletExists || isLocked) return null

    const baseAssets = pickBy(
      assetsModule.getAssets(),
      (asset) => asset.baseAsset.name === asset.name && !asset.isCombined
    )

    let [{ value: accountStates }, enabledWalletAccounts, availableAssetNamesByWalletAccount] =
      await Promise.all([
        accountStatesAtom.get(),
        enabledWalletAccountsAtom.get(),
        availableAssetNamesByWalletAccountAtom.get(),
      ])

    enabledWalletAccounts = pickBy(enabledWalletAccounts, ({ isCustodial }) => !isCustodial)
    availableAssetNamesByWalletAccount = pick(
      availableAssetNamesByWalletAccount,
      Object.keys(enabledWalletAccounts)
    )

    const getExtendedKeys = async ({ assetName, walletAccount, address }) => {
      const { keyIdentifier, purpose } = address.meta

      if (keyIdentifier.derivationAlgorithm !== 'BIP32' || keyIdentifier.keyType !== 'secp256k1')
        return

      const parts = keyIdentifier.derivationPath.split('/')
      const xpubKeyIdentifier = new KeyIdentifier({
        ...keyIdentifier,
        derivationPath: parts.slice(0, 4).join('/'),
      })

      try {
        const xpub = await publicKeyProvider.getExtendedPublicKey({
          walletAccount: walletAccount.toString(),
          keyIdentifier: xpubKeyIdentifier,
        })

        if ([84, 86, 49].includes(purpose)) {
          return {
            xpub,
            zpub: convertXpub(xpub, 'zpub'),
          }
        }

        return { xpub }
      } catch {}
    }

    const getAssetSourceAddresses = async ({ assetName, walletAccountName }) => {
      const asset = baseAssets[assetName]
      const walletAccount = enabledWalletAccounts[walletAccountName]
      const supportedPurposes = await addressProvider.getSupportedPurposes({
        walletAccount,
        assetName,
      })

      return Promise.all(
        supportedPurposes.sort(lexicographicCompare).map(async (purpose) => {
          const purposeKey = `bip${purpose}`
          const addressData = Object.create(null)

          // TODO: remove when lightning becomes a regular asset
          // eslint-disable-next-line @exodus/hydra/no-asset-conditions
          if (assetName === 'lightningnetwork') {
            return [
              [walletAccountName, assetName, purposeKey],
              { address: accountStates[walletAccountName]?.[assetName]?.address },
            ]
          }

          try {
            const address = await addressProvider.getReceiveAddress({
              purpose,
              assetName,
              walletAccount,
            })

            addressData.address = address.toString()

            if (asset.api.features.abstractAccounts) {
              addressData.encodedPublicKey = await addressProvider.getEncodedPublicKey({
                walletAccount,
                assetName,
                purpose,
                chainIndex: 0,
                addressIndex: 0,
              })
            }

            const { path } = address.meta
            const chain = path ? BipPath.fromString(path).toPathArray() : undefined
            return [
              [walletAccountName, assetName, purposeKey],
              {
                ...addressData,
                chain,
                ...(await getExtendedKeys({ walletAccount, assetName, address })),
              },
            ]
          } catch (error) {
            return [[walletAccountName, assetName, purposeKey], { error: SafeError.from(error) }]
          }
        })
      )
    }

    const resultsByPath = await Promise.all(
      Object.entries(availableAssetNamesByWalletAccount).map(
        async ([walletAccountName, assetNamesSet]) =>
          Promise.all(
            [...assetNamesSet]
              .filter((assetName) => baseAssets[assetName])
              .sort((a, b) => a.localeCompare(b))
              .map(async (assetName) => getAssetSourceAddresses({ assetName, walletAccountName }))
          )
      )
    )

    const results = Object.create(null)
    resultsByPath.flat(2).forEach(([path, value]) => set(results, path, value))
    return results
  },
  import: addressProvider.importReport,
  getSchema: memoize(() => {
    const assetSource = z
      .object({
        address: z.string().nullable(),
        chain: z.tuple([z.number(), z.number()]),
        xpub: z.string().nullable(),
        zpub: z.string().nullable(),
        encodedPublicKey: z.string().nullable(),
        error: z.instanceof(SafeError).nullable(),
      })
      .strict()
      .partial()

    const purposeKeys = z.record(z.string().regex(/^bip\d+/u), assetSource)

    // Maps asset names (e.g., "bitcoin", "ethereum") to their purpose keys.
    const assets = z.record(z.string(), purposeKeys)

    // Maps wallet accounts (e.g., "exodus_0") to their assets.
    return z
      .record(
        z.string().regex(new RegExp(`^(${WalletAccount.VALID_SOURCES.join('|')})`, 'u')),
        assets
      )
      .nullable()
  }),
})

const addressProviderReportDefinition = {
  id: 'addressProviderReport',
  type: 'report',
  factory: createAddressProviderReport,
  dependencies: [
    'assetsModule',
    'enabledWalletAccountsAtom',
    'availableAssetNamesByWalletAccountAtom',
    'addressProvider',
    'publicKeyProvider',
    'accountStatesAtom',
  ],
  public: true,
}

export default addressProviderReportDefinition
