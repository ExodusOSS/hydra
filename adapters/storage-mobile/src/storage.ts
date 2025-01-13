import type { AsyncStorageStatic } from '@react-native-async-storage/async-storage/lib/typescript/types'
import { Storage } from '@exodus/storage-interface'
import assert from 'minimalistic-assert'
import { assertDefined, assertValidIdentifier } from './helpers/assertions'

export class StorageMobile<Value> implements Storage<Value> {
  readonly #asyncStorage: AsyncStorageStatic
  readonly #prefix: string

  constructor(asyncStorage: AsyncStorageStatic, prefix = '') {
    assert(asyncStorage, 'expected "asyncStorage"')
    this.#asyncStorage = asyncStorage
    this.#prefix = prefix
  }

  get = async (key: string): Promise<Value | undefined> =>
    this.batchGet([key]).then(([value]) => value)

  set = async (key: string, value: Value) => {
    assertDefined(value, 'Cannot save an undefined value.')
    await this.#asyncStorage.setItem(this.#normalizeKey(key), JSON.stringify(value))
  }

  delete = async (key: string) => {
    await this.#asyncStorage.removeItem(this.#normalizeKey(key))
  }

  clear = async () => {
    const keys = await this.#asyncStorage.getAllKeys()
    await this.#asyncStorage.multiRemove(keys.filter((key) => key.startsWith(this.#prefix)))
  }

  namespace = <Value>(prefix: string): Storage<Value> => {
    assertValidIdentifier(prefix)
    return new StorageMobile<Value>(this.#asyncStorage, `${this.#prefix}!${prefix}!`)
  }

  batchDelete = async (keys: string[]) => {
    await this.#asyncStorage.multiRemove(keys.map((key) => this.#normalizeKey(key)))
  }

  batchGet = async (keys: string[]): Promise<(Value | undefined)[]> => {
    const values = await this.#asyncStorage.multiGet(keys.map((key) => this.#normalizeKey(key)))
    return values.map(([, value]) => (value ? JSON.parse(value) : undefined))
  }

  batchSet = async (obj: { [p: string]: Value }) => {
    await this.#asyncStorage.multiSet(
      Object.entries(obj).map(([key, value]) => {
        assertDefined(value, `Cannot set an undefined value. Received undefined for key ${key}`)

        return [this.#normalizeKey(key), JSON.stringify(value)]
      })
    )
  }

  #normalizeKey = (key: string) => {
    assertValidIdentifier(key)

    return this.#prefix + key
  }
}
