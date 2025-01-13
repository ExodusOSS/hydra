import type { IMessageSigner, SignMessageParams } from '../module/interfaces.js'
import type { Definition } from '@exodus/dependency-types'

const createMessageSignerApi = ({ messageSigner }: { messageSigner: IMessageSigner }) => ({
  messageSigner: {
    signMessage: (params: SignMessageParams) => messageSigner.signMessage(params),
  },
})

const messageSignerApiDefinition = {
  id: 'messageSignerApi',
  type: 'api',
  factory: createMessageSignerApi,
  dependencies: ['messageSigner'],
} as const satisfies Definition

export default messageSignerApiDefinition
