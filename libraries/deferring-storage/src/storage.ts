import pDefer from 'p-defer'
import { Storage } from '@exodus/storage-interface'

export class DeferringStorage<In, Out> {
  readonly #ready = pDefer()
  readonly #storage: Storage<In, Out>

  constructor(storage: Storage<In, Out>, ready = pDefer()) {
    this.#storage = storage
    this.#ready = ready

    return new Proxy(this, {
      get: (target, prop: keyof DeferringStorage<In, Out>) => {
        if (prop in target && typeof target[prop] === 'function') {
          return (...args: [never, never]) => target[prop](...args)
        }

        if (typeof this.#storage[prop as keyof Storage] === 'function') {
          return async (...args: [never, never]) => {
            await this.#ready.promise
            return this.#storage[prop as keyof Storage](...args)
          }
        }

        return this.#storage[prop]
      },
    })
  }

  namespace = (...args: Parameters<Storage['namespace']>) =>
    new DeferringStorage(this.#storage.namespace(...args), this.#ready)

  clear = () => this.#storage.clear()

  set = async (key: string, value: In) => {
    if (value !== undefined) {
      await this.#ready.promise
    }

    await this.#storage.set(key, value)
  }

  delete = async (...args: Parameters<Storage['delete']>) => this.#storage.delete(...args)

  release = () => {
    this.#ready.resolve()
  }
}

export default function createDeferringStorage<In, Out>(
  storage: Storage<In, Out>
): DeferringStorage<In, Out> & Omit<Storage<In, Out>, 'namespace'> {
  return new DeferringStorage(storage) as DeferringStorage<In, Out> &
    Omit<Storage<In, Out>, 'namespace'>
}
