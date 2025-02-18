import { createRpcFeature } from '../../utils/ioc'

const cachedSodiumEncryptorRpc = (api) => createRpcFeature('cachedSodiumEncryptor', api)

export default cachedSodiumEncryptorRpc
