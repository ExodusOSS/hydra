import type { Atom, ReadonlyAtom } from '../utils/types.js'

const readOnly = <T>(atom: Atom<T>): ReadonlyAtom<T> => {
  const set = async () => {
    throw new Error('selected atom does not support set')
  }

  return {
    ...atom,
    set,
  } as ReadonlyAtom<T>
}

export default readOnly
