import { AlreadyRegisteredError } from './errors.js'
import assert from 'minimalistic-assert'
import { CONTAINER_ID } from './utils.js'
import type { Entry } from './types.js'

export default class Registry {
  #nodes = new Map()

  set({ id, entry, override = false }: { id: string; entry: Entry; override?: boolean }) {
    if (this.#nodes.has(id) && !override) {
      throw new AlreadyRegisteredError(id)
    }

    this.#nodes.set(id, entry)
  }

  get(id: string) {
    return this.#nodes.get(id)
  }

  setInstance({ id, instance }: { id: string; instance: any }) {
    const node = this.#nodes.get(id)
    node.instance = instance
  }

  getInstance({
    id,
    parent,
  }: {
    id: string
    parent: Entry | { id: typeof CONTAINER_ID; namespace?: string }
  }) {
    const node = this.#nodes.get(id)

    if (!node) {
      return
    }

    assert(
      !node.private ||
        !node.namespace ||
        node.namespace === parent.namespace ||
        parent.id === CONTAINER_ID,
      `Requested private dependency "${id}" in namespace "${
        node.namespace
      }" from "${parent.id.toString()}" in namespace "${parent.namespace}"`
    )

    return node.instance
  }

  nodes() {
    return this.#nodes.values()
  }
}
