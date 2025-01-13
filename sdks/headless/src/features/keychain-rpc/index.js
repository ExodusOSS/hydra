import { createRpcFeature } from '../../utils/ioc'

const keychainRpc = (api) => createRpcFeature('keychain', api)

export default keychainRpc
