import headlessAnalyticsPluginDefinition from '../plugins/analytics'
import headlessUiLifecyclePluginDefinition from '../plugins/headless-ui'
import logLifecyclePluginDefinition from '../plugins/log-lifecycle'

const createPluginDependencies = () => [
  { definition: logLifecyclePluginDefinition },
  { definition: headlessUiLifecyclePluginDefinition },
  {
    if: { registered: ['analytics'] },
    definition: headlessAnalyticsPluginDefinition,
  },
]

export default createPluginDependencies
