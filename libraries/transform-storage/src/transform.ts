import { Storage } from '@exodus/storage-interface'
import { mapValuesAsync } from '@exodus/basic-utils'
import assert from 'minimalistic-assert'
import { MaybePromise } from './helpers/types'

type ConstructorParameters<In, Transformed, Out> = {
  storage: Storage<Transformed>
  onRead?: (
    value: Transformed | undefined,
    key: string
  ) => MaybePromise<Out | Transformed | undefined>
  onWrite?: (value: In, key: string) => MaybePromise<In | Transformed | undefined>
}

export default function transformStorage<In, Transformed, Out>({
  storage,
  onRead,
  onWrite,
}: ConstructorParameters<In, Transformed, Out>): Storage<In, Out | Transformed> {
  assert(storage, 'missing storage')
  assert(onRead || onWrite, 'one of onRead, onWrite has to be specified')

  const _transformOnRead = onRead ?? ((value) => value)
  const _transformOnWrite = onWrite ?? ((value) => value)
  const transformOnRead = async (value: Transformed | undefined, key: string) => {
    try {
      return await _transformOnRead(value, key)
    } catch (err: unknown) {
      throw new Error(`Failed to transform read value for key "${key}"`, { cause: err })
    }
  }

  const transformOnWrite = async (value: In, key: string) => {
    try {
      return await _transformOnWrite(value, key)
    } catch (err: unknown) {
      throw new Error(`Failed to transform write value for key "${key}"`, { cause: err })
    }
  }

  return {
    ...storage,
    namespace: (prefix: string) =>
      transformStorage({
        storage: storage.namespace(prefix),
        onWrite: transformOnWrite,
        onRead: transformOnRead,
      }),
    set: async (key, value) => storage.set(key, (await transformOnWrite(value, key)) as never),
    batchSet: async (obj) =>
      storage.batchSet((await mapValuesAsync(obj, transformOnWrite)) as never),
    get: async (key) => transformOnRead(await storage.get(key), key),
    batchGet: async (keys) => {
      const values = await storage.batchGet(keys)
      return Promise.all(values.map((value, i) => transformOnRead(value, keys[i] as string)))
    },
  }
}
