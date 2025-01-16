import { SEPARATOR } from './constants.js'

export const serializePath = (path) => path.join(SEPARATOR)

const RESERVED_METHODS = new Set(['callMethod', 'notify', 'exposeMethods'])

const createProxy = (rpc, target, path = []) => {
  const cache = Object.create(null)

  return new Proxy(target, {
    get: (object, property) => {
      // If the property is a function, call the method at that path instead
      // of appending the property to the path again. This happens when 'apply'
      // is called as the property here, and we don't want to append 'apply'.
      // TODO: investigate why rpc proxying calls the get trap with 'apply'
      if (typeof object[property] === 'function') {
        return (applyTarget, ...args) => {
          const method = serializePath(path)
          return rpc.callMethod(method, args)
        }
      }

      const fn = async (...params) => {
        if (RESERVED_METHODS.has(property)) {
          return rpc[property](...params)
        }

        const method = serializePath([...path, property])
        return rpc.callMethod(method, params)
      }

      if (cache[property]) return cache[property]

      const proxy = createProxy(rpc, fn, [...path, property])

      cache[property] = proxy

      return proxy
    },
  })
}

const createRPCClient = (rpc) => createProxy(rpc, rpc)

export default createRPCClient
