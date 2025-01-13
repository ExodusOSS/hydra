import type blockchainMetadataApiDefinition from './api/index.js'

declare const blockchainMetadata: () => {
  id: 'blockchainMetadata'
  definitions: [{ definition: typeof blockchainMetadataApiDefinition }]
}

export default blockchainMetadata
