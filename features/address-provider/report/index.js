import BipPath from 'bip32-path'
import { set, pick, pickBy } from '@exodus/basic-utils'
import KeyIdentifier from '@exodus/key-identifier'
import convertXpub from 'xpub-converter'

const lexicographicCompare = (a, b) => String(a).localeCompare(String(b))

const createAddressProviderReport = ({
  assetsModule,
  publicKeyProvider,
  enabledWalletAccountsAtom,
  availableAssetNamesByWalletAccountAtom,
  addressProvider,
}) => ({
  namespace: 'addressProvider',
  export: async () => {
    const baseAssets = pickBy(
      assetsModule.getAssets(),
      (asset) => asset.baseAsset.name === asset.name && !asset.isCombined
    )

    let [enabledWalletAccounts, availableAssetNamesByWalletAccount] = await Promise.all([
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
      const walletAccount = enabledWalletAccounts[walletAccountName]
      const supportedPurposes = await addressProvider.getSupportedPurposes({
        walletAccount,
        assetName,
      })

      return Promise.all(
        supportedPurposes.sort(lexicographicCompare).map(async (purpose) => {
          const purposeKey = `bip${purpose}`
          try {
            const address = await addressProvider.getReceiveAddress({
              purpose,
              assetName,
              walletAccount,
            })

            const { path } = address.meta
            const chain = path ? BipPath.fromString(path).toPathArray() : undefined
            return [
              [walletAccountName, assetName, purposeKey],
              {
                address: address.toString(),
                chain,
                ...(await getExtendedKeys({ walletAccount, assetName, address })),
              },
            ]
          } catch (error) {
            return [[walletAccountName, assetName, purposeKey], { error }]
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
  ],
  public: true,
}

export default addressProviderReportDefinition
