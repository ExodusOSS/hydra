import type addressProviderApiDefinition from './api/index.js'
import type { Definition } from '@exodus/dependency-types'

declare const addressProvider: () => {
  id: 'addressProvider'
  definitions: [{ definition: typeof addressProviderApiDefinition }]
}

export declare const addressCache: () => {
  id: 'addressCache'
  definitions: [{ definition: typeof Definition }]
}

export default addressProvider
