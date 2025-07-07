import headlessAnalyticsPluginDefinition from '../plugins/analytics.js'
import headlessUiLifecyclePluginDefinition from '../plugins/headless-ui.js'
import logLifecyclePluginDefinition from '../plugins/log-lifecycle.js'

const createPluginDependencies = () => [
  { definition: logLifecyclePluginDefinition },
  { definition: headlessUiLifecyclePluginDefinition },
  {
    if: { registered: ['analytics'] },
    definition: headlessAnalyticsPluginDefinition,
  },
]

export default createPluginDependencies
