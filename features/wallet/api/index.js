const createWalletApi = ({ wallet }) => {
  return {
    wallet: {
      exists: wallet.exists,
      hasPassphraseSet: wallet.hasPassphraseSet,
      isLocked: wallet.isLocked,
      getMnemonic: wallet.getMnemonic,
      getSeedMetadata: wallet.getSeedMetadata,
      getPrimarySeedId: wallet.getPrimarySeedId,
      getExtraSeedIds: wallet.getExtraSeedIds,
      addSeed: wallet.addSeed,
      updateSeed: wallet.updateSeed,
      removeManySeeds: wallet.removeManySeeds,
      removeSeed: wallet.removeSeed,
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
