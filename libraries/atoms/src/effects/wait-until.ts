import type { Atom, Unsubscribe } from '../utils/types.js'

type Params<T> = {
  atom: Atom<T>
  predicate: (value: T) => boolean
  rejectAfter?: number
}

type UnobservablePromise<T> = Promise<T> & { unobserve: () => void }

const waitUntil = <T>({ atom, predicate, rejectAfter }: Params<T>): UnobservablePromise<T> => {
  let unobserve: Unsubscribe
  let timeout: ReturnType<typeof setTimeout>
  const promise = new Promise<T>((resolve, reject) => {
    unobserve = atom.observe((v) => {
      if (predicate(v)) {
        clearTimeout(timeout)
        unobserve()
        resolve(v)
      }
    })

    if (rejectAfter) {
      timeout = setTimeout(() => {
        unobserve()
        reject(new Error('rejected by timeout'))
      }, rejectAfter)
    }
  })

  void Object.defineProperty(promise, 'unobserve', {
    value: () => {
      unobserve()
      clearTimeout(timeout)
    },
    writable: false,
  })

  return promise as UnobservablePromise<T>
}

export default waitUntil
