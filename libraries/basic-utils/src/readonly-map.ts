import assert from 'minimalistic-assert'

const throwReadOnly = (): never => {
  throw new Error('this Map is read-only!')
}

export class ReadonlyMap<K, V> implements ReadonlyMap<K, V> {
  #map: Map<K, V>

  constructor(map: Map<K, V>) {
    assert(map instanceof Map, 'expected Map')
    this.#map = map
  }

  get size(): number {
    return this.#map.size
  }

  get(key: K): V | undefined {
    return this.#map.get(key)
  }

  has(key: K): boolean {
    return this.#map.has(key)
  }

  entries(): IterableIterator<[K, V]> {
    return this.#map.entries()
  }

  forEach(callbackfn: (value: V, key: K, map: ReadonlyMap<K, V>) => void): void {
    this.#map.forEach((value, key) => callbackfn(value, key, this))
  }

  keys(): IterableIterator<K> {
    return this.#map.keys()
  }

  values(): IterableIterator<V> {
    return this.#map.values()
  }

  set(): never {
    return throwReadOnly()
  }

  clear(): never {
    return throwReadOnly()
  }

  delete(): never {
    return throwReadOnly()
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.#map[Symbol.iterator]()
  }

  get [Symbol.toStringTag](): string {
    return 'ReadonlyMap'
  }
}
