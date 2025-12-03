import cachedSodiumEncryptorDefinition from './module/index.js'
import cachedSodiumEncryptorApiDefinition from './api/index.js'

const cachedSodiumEncryptor = () => ({
  id: 'cachedSodiumEncryptor',
  definitions: [
    {
      definition: cachedSodiumEncryptorDefinition,
    },
    { definition: cachedSodiumEncryptorApiDefinition },
  ],
})

export default cachedSodiumEncryptor
