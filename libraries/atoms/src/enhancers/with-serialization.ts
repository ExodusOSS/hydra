import type { Atom, Setter } from '../utils/types.js'
import { isSetter } from '../utils/guards.js'

type Params<T, S> = {
  atom: Atom<S>
  serialize: (value: T) => S
  deserialize: (serialized: S) => T
}

const withSerialization = <T, S>({
  atom,
  serialize: customSerialize,
  deserialize: customDeserialize,
}: Params<T, S>): Atom<T> => {
  const serialize = (value: T) => (value === undefined ? undefined : customSerialize(value)) as S
  const deserialize = (value: S) =>
    (value === undefined ? undefined : customDeserialize(value)) as T

  const get = async () => {
    const serialized = await atom.get()
    return deserialize(serialized)
  }

  const set = async (value: T | Setter<T>) => {
    if (isSetter(value)) {
      return atom.set(async (previousValue) => serialize(await value(deserialize(previousValue))))
    }

    const serialized = serialize(value)
    return atom.set(serialized)
  }

  const observe = (callback: (value: T, serialized: S) => Promise<void> | void) => {
    return atom.observe((value) => callback(deserialize(value), value))
  }

  return { ...atom, get, set, observe }
}

export default withSerialization
