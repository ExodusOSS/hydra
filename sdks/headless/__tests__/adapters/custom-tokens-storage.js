import createInMemoryStorage from '@exodus/storage-memory'

const createCustomTokensStorage = () => createInMemoryStorage().namespace('customTokens')

export default createCustomTokensStorage
