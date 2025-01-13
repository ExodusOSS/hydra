import {
  messageSignerDefinition,
  seedBasedMessageSignerDefinition,
  hardwareMessageSignerDefinition,
} from './module/index.js'
import messageSignerApiDefinition from './api/index.js'

const messageSigner = () => {
  return {
    id: 'messageSigner',
    definitions: [
      {
        definition: messageSignerDefinition,
      },
      {
        definition: seedBasedMessageSignerDefinition,
      },
      {
        if: { registered: ['hardwareWallets'] },
        definition: hardwareMessageSignerDefinition,
      },
      {
        definition: messageSignerApiDefinition,
      },
    ],
  }
}

export default messageSigner
