export const UI_STORAGE_KEY = 'ui'

const headlessUiLifecyclePluginDefinition = {
  type: 'plugin',
  id: 'headlessUiLifecyclePlugin',
  factory: ({ storage }) => {
    const onClear = async () => {
      storage.namespace(UI_STORAGE_KEY).clear()
    }

    return { onClear }
  },
  dependencies: ['storage'],
}

export default headlessUiLifecyclePluginDefinition
