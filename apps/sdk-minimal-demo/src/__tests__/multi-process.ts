import { memoize } from '@exodus/basic-utils'
import createSerialization from '@exodus/domain-serialization'
import { RPC } from '@exodus/sdk-rpc'
import EventEmitter from 'eventemitter3'

type Listener = (...args: any[]) => void

const noopSerialization = (data: any): any => data

const { serialize, deserialize } = createSerialization({
  serializeAsset: (asset: any) => ({
    name: asset.name,
    assetType: asset.assetType,
    currency: asset.currency,
  }),
  deserializeAsset: ({ name }: { name: string }) => {
    return { name }
  },
})

export { deserialize, serialize }

export class Thread {
  onmessage = (msg: any): void => {
    throw new Error(`override me or you'll miss out on: ${msg}`)
  }

  postMessage = (msg: any): void => {
    throw new Error(`override me or you'll miss out on: ${msg}`)
  }
}

export class PortTransport extends EventEmitter {
  #thread
  #serialize
  #deserialize
  #listeners: Listener[] = []
  constructor({
    thread,
    serialize = noopSerialization,
    deserialize = noopSerialization,
  }: {
    thread: Thread
    serialize?: (data: any) => any
    deserialize?: (data: string | object) => any
  }) {
    super()

    this.#thread = thread
    this.#serialize = serialize
    this.#deserialize = deserialize
  }

  get onMessage() {
    return this.#onmessage
  }

  #onmessage = (event: any) => {
    this.#listeners.forEach((listener) => listener(event))
  }

  write(data: any) {
    this.#thread.postMessage(this.#serialize(data))
  }

  #wrapListener = memoize((listener: Listener) => (data: any) => listener(this.#deserialize(data)))

  on(eventName: string | symbol, listener: Listener) {
    listener = this.#wrapListener(listener)

    super.on(eventName, listener)

    if (eventName === 'data') {
      this.#listeners.push(listener)
    }

    return this
  }

  removeListener(eventName: string | symbol, listener: Listener) {
    listener = this.#wrapListener(listener)
    super.removeListener(eventName, listener)

    if (eventName === 'data') {
      this.#listeners = this.#listeners.filter((l) => l !== listener)
    }

    return this
  }
}

export const createProcessRPC = (thread: Thread) => {
  const transport = new PortTransport({ thread, serialize, deserialize })
  // eslint-disable-next-line  @exodus/mutable/no-param-reassign-prop-only, unicorn/prefer-add-event-listener
  thread.onmessage = transport.onMessage

  const rpc = new RPC({ transport, serialize: noopSerialization, deserialize: noopSerialization })

  return {
    transport,
    rpc,
  }
}

export const connectThreads = (a: Thread, b: Thread) => {
  // eslint-disable-next-line  @exodus/mutable/no-param-reassign-prop-only
  a.postMessage = b.onmessage
  // eslint-disable-next-line  @exodus/mutable/no-param-reassign-prop-only
  b.postMessage = a.onmessage
}
