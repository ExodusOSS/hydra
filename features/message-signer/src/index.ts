import {
  messageSignerDefinition,
  seedBasedMessageSignerDefinition,
  hardwareMessageSignerDefinition,
} from './module/index.js'
import messageSignerApiDefinition from './api/index.js'

export type { IMessageSigner, IUnsignedMessage, SignMessageParams } from './module/interfaces.js'

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
