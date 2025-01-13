import type { KeyViewer } from '../module/key-viewer.js'
import type { Definition } from '@exodus/dependency-types'
import type { Logger } from '@exodus/logger'

type Dependencies = {
  keyViewer: KeyViewer
  logger: Logger
}

const createKeyViewerApi = ({ keyViewer, logger }: Dependencies) => ({
  keyViewer: {
    async getEncodedPrivateKey(...args: Parameters<KeyViewer['getEncodedPrivateKeys']>) {
      logger.warn(
        'keyViewer.getEncodedPrivateKey is deprecated, use keyViewer.getEncodedPrivateKeys instead'
      )
      const [{ privateKey }] = await keyViewer.getEncodedPrivateKeys(...args)

      return privateKey
    },
    getEncodedPrivateKeys: keyViewer.getEncodedPrivateKeys,
  },
})

const keyViewerApiDefinition = {
  id: 'keyViewerApi',
  type: 'api',
  factory: createKeyViewerApi,
  dependencies: ['keyViewer', 'logger'],
} as const satisfies Definition

export default keyViewerApiDefinition
