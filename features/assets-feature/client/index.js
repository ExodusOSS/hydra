import createAssetClientInterface from './asset-client-interface.js'

const assetsClientInterfaceDefinition = {
  id: 'assetClientInterface',
  type: 'module',
  factory: createAssetClientInterface,
  dependencies: [
    'blockchainMetadata',
    'createLogger',
    'wallet',
    'walletAccountsAtom',
    'enabledWalletAccountsAtom',
    'assetsModule',
    'availableAssetNamesAtom',
    'addressProvider',
    'feeMonitors',
    'transactionSigner',
    'publicKeyProvider',
    'config?',
  ],
  public: true,
}

export default assetsClientInterfaceDefinition
