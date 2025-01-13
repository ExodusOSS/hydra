const logLifecyclePluginDefinition = {
  id: 'logLifecyclePlugin',
  type: 'plugin',
  factory: ({ logger }) => {
    return {
      onLock: () => logger.debug('onLock'),
      onUnlock: () => logger.debug('onUnlock'),
      onClear: () => logger.debug('onClear'),
      onImport: () => logger.debug('onImport'),
      onMigrate: () => logger.debug('onMigrate'),
      onStart: () => logger.debug('onStart'),
      onRestart: () => logger.debug('onRestart'),
      onLoad: () => logger.debug('onLoad'),
      onUnload: () => logger.debug('onUnload'),
      onCreate: () => logger.debug('onCreate'),
      onRestore: () => logger.debug('onRestore'),
      onRestoreCompleted: () => logger.debug('onRestoreCompleted'),
      onAssetsSynced: () => logger.debug('onAssetsSynced'),
      onChangePassphrase: () => logger.debug('onChangePassphrase'),
    }
  },
  dependencies: ['logger'],
  public: true,
}

export default logLifecyclePluginDefinition
