import createAssetClientInterface from './asset-client-interface.js'

const assetsClientInterfaceDefinition = {
  id: 'assetClientInterface',
  type: 'module',
  factory: createAssetClientInterface,
  dependencies: [
    'addressProvider',
    'assetsModule',
    'assetSources',
    'availableAssetNamesAtom',
    'blockchainMetadata',
    'config?',
    'createLogger',
    'enabledWalletAccountsAtom',
    'feeMonitors',
    'publicKeyProvider',
    'transactionSigner',
    'wallet',
    'walletAccountsAtom',
    'multisigAtom?',
  ],
  public: true,
}

export default assetsClientInterfaceDefinition
