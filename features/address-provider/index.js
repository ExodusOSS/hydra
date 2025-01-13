import addressCache from './address-cache.js'
import addressProviderDefinition, { mockableAddressProviderDefinition } from './module/index.js'
import addressProviderApiDefinition from './api/index.js'
import knownAddressesDefinition from './module/known-addresses.js'
import addressProviderReportDefinition from './report/index.js'
import addressProviderPluginDefinition from './plugin/index.js'
import addressProviderDebugDefinition from './debug/index.js'

const addressProvider = ({ addressCacheFlavor = 'memory', debug } = Object.create(null)) => ({
  id: 'addressProvider',
  definitions: [
    ...addressCache({ config: { flavor: addressCacheFlavor } }).definitions,
    {
      definition: debug
        ? { ...mockableAddressProviderDefinition, id: addressProviderDefinition.id }
        : addressProviderDefinition,
    },
    { definition: addressProviderApiDefinition },
    { definition: knownAddressesDefinition },
    { definition: addressProviderPluginDefinition },
    { definition: addressProviderReportDefinition },
    { definition: addressProviderDebugDefinition },
  ],
})

export default addressProvider
