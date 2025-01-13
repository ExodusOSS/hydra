import assert from 'minimalistic-assert'

const throwReadOnly = () => {
  throw new Error('this Set is read-only!')
}

export class ReadonlySet {
  #set
  constructor(set) {
    assert(set instanceof Set, 'expected Set')
    this.#set = set
  }

  get size() {
    return this.#set.size
  }

  has(value) {
    return this.#set.has(value)
  }

  entries() {
    return this.#set.entries()
  }

  forEach(...args) {
    return this.#set.forEach(...args)
  }

  keys() {
    return this.#set.keys()
  }

  values() {
    return this.#set.values()
  }

  add() {
    throwReadOnly()
  }

  delete() {
    throwReadOnly()
  }

  clear() {
    throwReadOnly()
  }

  [Symbol.iterator]() {
    return this.#set[Symbol.iterator]()
  }

  get [Symbol.toStringTag]() {
    return 'ReadonlySet'
  }
}
