const createWalletApi = ({ wallet }) => {
  return {
    wallet: {
      exists: wallet.exists,
      hasPassphraseSet: wallet.hasPassphraseSet,
      isLocked: wallet.isLocked,
      getMnemonic: wallet.getMnemonic,
      getSeedMetadata: wallet.getSeedMetadata,
      getPrimarySeedId: wallet.getPrimarySeedId,
      create: wallet.create,
      import: wallet.import,
      clear: wallet.clear,
      lock: wallet.lock,
      unlock: wallet.unlock,
      changePassphrase: wallet.changePassphrase,
    },
  }
}

const walletApiDefinition = {
  id: 'walletApi',
  type: 'api',
  factory: createWalletApi,
  dependencies: ['wallet'],
}

export default walletApiDefinition
