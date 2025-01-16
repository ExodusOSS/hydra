import EventEmitter from 'eventemitter3'
import pDefer from 'p-defer'

// There can be multiple UIs connected using the same port name
// This class handles all rpc instances as if they were one
class RPCManager {
  #defer = pDefer()
  #instances = new Map()
  #emitter = new EventEmitter()

  add(id, rpc) {
    this.#instances.set(id, rpc)
    this.#defer.resolve()

    rpc.on('end', () => {
      this.#instances.delete(id)

      if (!this.exists()) {
        this.#defer = pDefer()
        this.#emitter.emit('end')
      }
    })
  }

  exists({ id } = {}) {
    if (id != null) {
      return this.#instances.has(id)
    }

    return this.#instances.size > 0
  }

  async callMethod(method, params) {
    await this.#defer.promise

    const instances = [...this.#instances.values()]
    const promises = instances.map((instance) => instance.callMethod(method, params))

    return Promise.race(promises)
  }

  async callMethodWithRawResponse(method, params) {
    await this.#defer.promise

    const instances = [...this.#instances.values()]
    const promises = instances.map((instance) => instance.callMethodWithRawResponse(method, params))

    return Promise.race(promises)
  }

  async notify(method, params) {
    await this.#defer.promise

    const instances = [...this.#instances.values()]
    const promises = instances.map((instance) => instance.notify(method, params))

    return Promise.race(promises)
  }

  on(eventName, listener) {
    this.#emitter.on(eventName, listener)
  }

  once(eventName, listener) {
    this.#emitter.once(eventName, listener)
  }
}

export default RPCManager
