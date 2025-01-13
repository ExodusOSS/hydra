import type { Atom, Listener } from '../utils/types.js'

type Params<T extends object> = {
  atom: Atom<T>
  value: T
}

const mergeWithValue = <T extends object>({ atom, value }: Params<T>): Atom<T> => {
  const get = async () => {
    const values = await atom.get()
    return { ...value, ...values }
  }

  const observe = (callback: Listener<T>) => {
    return atom.observe((values) => {
      const finalValue = { ...value, ...values }
      return callback(finalValue)
    })
  }

  const set = async (newValue: T | ((newValue: T) => T)) => {
    if (typeof newValue === 'function') {
      return atom.set((currentValue) => {
        return newValue({ ...value, ...currentValue })
      })
    }

    return atom.set({ ...value, ...newValue })
  }

  return {
    ...atom,
    set,
    get,
    observe,
  } as Atom<T>
}

export default mergeWithValue
