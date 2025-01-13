const fusionLocalLifecyclePluginDefinition = {
  type: 'plugin',
  id: 'fusionLifecyclePlugin',
  factory: ({ fusion, fusionUnlockDeferred }) => {
    const onUnlock = () => {
      fusionUnlockDeferred.resolve()
    }

    const onClear = async () => {
      fusionUnlockDeferred.resolve()

      await fusion.clearStorage()
    }

    return { onUnlock, onClear }
  },
  dependencies: ['fusion', 'fusionUnlockDeferred'],
  public: true,
}

export default fusionLocalLifecyclePluginDefinition
