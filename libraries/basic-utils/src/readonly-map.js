import assert from 'minimalistic-assert'

const throwReadOnly = () => {
  throw new Error('this Map is read-only!')
}

export class ReadonlyMap {
  #map
  constructor(map) {
    assert(map instanceof Map, 'expected Map')
    this.#map = map
  }

  get size() {
    return this.#map.size
  }

  get(key) {
    return this.#map.get(key)
  }

  has(key) {
    return this.#map.has(key)
  }

  entries() {
    return this.#map.entries()
  }

  forEach(...args) {
    return this.#map.forEach(...args)
  }

  keys() {
    return this.#map.keys()
  }

  values() {
    return this.#map.values()
  }

  set() {
    throwReadOnly()
  }

  clear() {
    throwReadOnly()
  }

  delete() {
    throwReadOnly()
  }

  [Symbol.iterator]() {
    return this.#map[Symbol.iterator]()
  }

  get [Symbol.toStringTag]() {
    return 'ReadonlyMap'
  }
}
