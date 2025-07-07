import { createRpcFeature } from '../../utils/ioc.js'

const cachedSodiumEncryptorRpc = (api) => createRpcFeature('cachedSodiumEncryptor', api)

export default cachedSodiumEncryptorRpc
