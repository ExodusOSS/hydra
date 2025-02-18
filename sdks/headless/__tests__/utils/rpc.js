import createDomainSerialization from '@exodus/domain-serialization'
import { createRPCClient, RPC } from '@exodus/sdk-rpc'
import { EventEmitter } from 'events/events.js'

export const createRPC = (api) => {
  const transport1 = new EventEmitter()
  const transport2 = new EventEmitter()

  transport1.write = (data) => setTimeout(() => transport2.emit('data', data))
  transport2.write = (data) => setTimeout(() => transport1.emit('data', data))

  const { deserialize, serialize } = createDomainSerialization({
    serializeAsset: ({ name }) => {
      const errorMessage = `Refusing to serialize asset ${name}`
      console.error(errorMessage)
      throw new Error(errorMessage)
    },
    deserializeAsset: ({ name }) => {
      const errorMessage = `Refusing to deserialize asset ${name}`
      console.error(errorMessage)
      throw new Error(errorMessage)
    },
  })

  const server = new RPC({
    transport: transport1,
    deserialize,
    serialize,
  })

  server.exposeMethods(api)

  const client = new RPC({
    transport: transport2,
    deserialize,
    serialize,
  })

  return createRPCClient(client)
}
