import { SEPARATOR } from './constants.js'
import type RPC from './rpc.js'
import type { Fn } from './types.js'

export const serializePath = (path: string[]) => path.join(SEPARATOR)

type RpcMethods = { [Key in keyof RPC as RPC[Key] extends Fn ? Key : never]: RPC[Key] }
type RpcMethod = keyof RpcMethods

const RESERVED_METHODS = new Set<RpcMethod>(['callMethod', 'notify', 'exposeMethods'])
const isReservedMethod = (method: string | symbol): method is RpcMethod =>
  RESERVED_METHODS.has(method as RpcMethod)

const createProxy = (rpc: RPC, target: any, path: string[] = []) => {
  const cache = Object.create(null)

  return new Proxy(target, {
    get: (object, property) => {
      // If the property is a function, call the method at that path instead
      // of appending the property to the path again. This happens when 'apply'
      // is called as the property here, and we don't want to append 'apply'.
      // TODO: investigate why rpc proxying calls the get trap with 'apply'
      if (typeof object[property] === 'function' && !isReservedMethod(property)) {
        return (applyTarget: any, ...args: any[]) => {
          const method = serializePath(path)
          return rpc.callMethod(method, args)
        }
      }

      const fn = async (...params: [any, any]) => {
        if (isReservedMethod(property)) {
          return rpc[property](...params)
        }

        const method = serializePath([...path, property as string])
        return rpc.callMethod(method, params)
      }

      if (cache[property]) return cache[property]

      const proxy = createProxy(rpc, fn, [...path, property as string])

      cache[property] = proxy

      return proxy
    },
  })
}

const createRPCClient = <Api = { [key: string]: any }>(rpc: RPC): RPCClient<Api> =>
  createProxy(rpc, rpc)

export type RPCClient<Api = { [key: string]: any }> = Pick<
  RPC,
  'callMethod' | 'notify' | 'exposeMethods'
> &
  Api

export default createRPCClient
