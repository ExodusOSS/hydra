import { connectedAccountsAtomDefinition, connectedOriginsAtomDefinition } from './atoms/index.js'
import connectedOriginsDefinition from './module/index.js'
import connectedOriginsApiDefinition from './api/index.js'
import connectedOriginsPluginDefinition from './plugin/index.js'

const STORAGE_NAMESPACE = 'connectedOrigins'

const connectedOrigins = () => {
  return {
    id: 'connectedOrigins',
    definitions: [
      {
        definition: connectedOriginsAtomDefinition,
        storage: { namespace: STORAGE_NAMESPACE },
        aliases: [
          {
            implementationId: 'unsafeStorage',
            interfaceId: 'storage',
          },
        ],
      },
      {
        definition: connectedAccountsAtomDefinition,
        storage: { namespace: STORAGE_NAMESPACE },
        aliases: [
          {
            implementationId: 'unsafeStorage',
            interfaceId: 'storage',
          },
        ],
      },
      {
        definition: connectedOriginsDefinition,
      },
      { definition: connectedOriginsPluginDefinition },
      { definition: connectedOriginsApiDefinition },
    ],
  }
}

export default connectedOrigins
