import { createRpcFeature } from '../../utils/ioc.js'

const keychainRpc = (api) => createRpcFeature('keychain', api)

export default keychainRpc
