import { createRPCClient, RPC } from '@exodus/sdk-rpc'
import PortTransport from './port-transport.js'
import RPCManager from './rpc-manager.js'
import RuntimePort from './runtime-port.js'

const DEFAULT_PORT_NAME = 'app'

const createRpc = ({ port, methods, serialize, deserialize, onData }) => {
  const transport = new PortTransport({ port })
  const rpc = new RPC({ transport, serialize, deserialize })

  if (onData)
    transport.on('data', (data) => {
      onData(typeof data === 'string' ? deserialize(data) : data)
    })

  if (methods) {
    rpc.exposeMethods(methods)
  }

  return rpc
}

export const createUiRpc = ({
  name = DEFAULT_PORT_NAME,
  methods,
  serialize,
  deserialize,
  onData,
}) => {
  const port = new RuntimePort({ name })
  const rpc = createRpc({ port, methods, serialize, deserialize, onData })
  return createRPCClient(rpc)
}

export const createBackgroundRpc = ({
  name = DEFAULT_PORT_NAME,
  methods,
  serialize,
  deserialize,
  onData,
  onConnect,
  onDisconnect,
}) => {
  const rpcManager = new RPCManager()

  const handlePortConnect = (port) => {
    const id = port.sender.tab?.id || port.sender.documentId

    if (port.name !== name) return

    const rpc = createRpc({ port, methods, serialize, deserialize, onData })

    port.onDisconnect.addListener(() => {
      rpc.end()
      onDisconnect?.()
    })

    rpcManager.add(id, rpc)

    onConnect?.()
  }

  chrome.runtime.onConnect.addListener(handlePortConnect)

  return rpcManager
}
