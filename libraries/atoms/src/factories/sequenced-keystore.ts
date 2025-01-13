import assert from 'minimalistic-assert'

import enforceObservableRules from '../enforce-rules.js'
import createSimpleObserver from '../simple-observer.js'
import type { Keystore, KeystoreValue } from '../utils/types.js'

const getRange = (offset: number, length: number) => Array.from({ length }, (_, i) => i + offset)

type Params = {
  keystore: Keystore
  config: {
    key: string
    getOpts?: object
    setOpts?: object
    deleteOpts?: object
    separator?: string
    isSoleWriter?: boolean
    defaultValue?: KeystoreValue[]
  }
}

const createSequencedKeystoreAtom = ({
  keystore,
  config: {
    //
    key,
    separator = '.',
    defaultValue = [],
    isSoleWriter,
    getOpts,
    setOpts,
    deleteOpts,
  },
}: Params) => {
  assert(key, 'sequence keystore atom: key missing')

  assert(typeof key === 'string', 'sequence keystore atom: key must be a string')

  assert(Array.isArray(defaultValue), 'sequence keystore atom: default value must be an array')

  const { notify, observe } = createSimpleObserver<KeystoreValue[] | undefined>({
    enable: isSoleWriter,
  })

  let cache: KeystoreValue[] | undefined

  const getKey = (index: number) =>
    key.endsWith(separator) ? `${key}${index}` : `${key}${separator}${index}`

  const getByIndex = async (index: number) => {
    const key = getKey(index)
    const value = await keystore.getSecret(key, getOpts)
    if (value) return { key, value }
  }

  const list = async () => {
    let result: { key: string; value: KeystoreValue }[] = []
    let batch: ({ key: string; value: KeystoreValue } | undefined)[] = []
    let offset = 0
    const batchSize = 5

    // paginate until we're out of items
    do {
      const range = getRange(offset, batchSize)
      batch = await Promise.all(range.map(getByIndex))
      batch = batch.filter(Boolean)
      result = [...result, ...batch] as { key: string; value: KeystoreValue }[]
      offset += batchSize
    } while (batch.length > 0)

    return result
  }

  const clear = async () => {
    const items = await list()
    await Promise.all(items.map((item) => keystore.deleteSecret(item.key, deleteOpts)))
  }

  const _set = async (value: KeystoreValue[]) => {
    assert(Array.isArray(value), 'sequence keystore atom: set value must be an array')

    await Promise.all(
      value.map((value, index) => {
        return keystore.setSecret(getKey(index), value, setOpts)
      })
    )
  }

  const set = async (value?: KeystoreValue[]) => {
    await clear()

    if (value !== undefined) {
      await _set(value)
    }

    if (isSoleWriter) {
      cache = value
      await notify(value)
    }
  }

  const get = async () => {
    if (cache) return cache

    const items = await list()
    const value = items.map((item) => item.value)

    if (isSoleWriter) {
      cache = value
    }

    // let default value be used
    return items.length === 0 ? undefined : value
  }

  return enforceObservableRules({
    get,
    set,
    observe,
    defaultValue,
  })
}

export default createSequencedKeystoreAtom
