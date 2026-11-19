import assert from 'minimalistic-assert'

const throwReadOnly = (): never => {
  throw new Error('this Set is read-only!')
}

export class ReadonlySet<T> implements ReadonlySet<T> {
  #set: Set<T>

  constructor(set: Set<T>) {
    assert(set instanceof Set, 'expected Set')
    this.#set = set
  }

  get size(): number {
    return this.#set.size
  }

  has(value: T): boolean {
    return this.#set.has(value)
  }

  entries(): IterableIterator<[T, T]> {
    return this.#set.entries()
  }

  forEach(callbackfn: (value: T, value2: T, set: ReadonlySet<T>) => void): void {
    this.#set.forEach((value, value2) => callbackfn(value, value2, this))
  }

  keys(): IterableIterator<T> {
    return this.#set.keys()
  }

  values(): IterableIterator<T> {
    return this.#set.values()
  }

  add(): never {
    return throwReadOnly()
  }

  delete(): never {
    return throwReadOnly()
  }

  clear(): never {
    return throwReadOnly()
  }

  [Symbol.iterator](): IterableIterator<T> {
    return this.#set[Symbol.iterator]()
  }

  get [Symbol.toStringTag](): string {
    return 'ReadonlySet'
  }
}
