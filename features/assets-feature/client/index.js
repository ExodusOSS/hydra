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
    'availableAssetNamesByWalletAccountAtom',
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
    'featureFlagAtoms?',
  ],
  public: true,
}

export default assetsClientInterfaceDefinition
