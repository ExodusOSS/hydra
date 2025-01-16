import RPC from '@exodus/json-rpc'
import { createWindowRpcTransport } from '@exodus/window-rpc-transport'

export const createRPC = ({ extensionName, channelName }) => {
  if (typeof extensionName !== 'string' || typeof channelName !== 'string') {
    throw new TypeError(`Unable to create RPC because channelName or extensionName are missing`)
  }

  const contentTransport = createWindowRpcTransport({
    name: `${extensionName}-${channelName}-window`,
    target: `${extensionName}-${channelName}`,
  })
  return new RPC({ transport: contentTransport })
}
