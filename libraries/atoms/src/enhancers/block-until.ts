import type { Atom, Listener } from '../utils/types.js'

type Params<T> = {
  atom: Atom<T>
  unblock: () => Promise<unknown>
}

export default function blockUntil<T>({ atom, unblock }: Params<T>) {
  const get = async () => unblock().then(atom.get)

  return {
    ...atom,
    get,
    observe: (listener: Listener<T>) => {
      let isSubscribed = true
      let unsubscribe = () => {}

      unblock().then(() => {
        if (isSubscribed) {
          unsubscribe = atom.observe(listener)
        }
      })

      return () => {
        isSubscribed = false
        unsubscribe()
      }
    },
  }
}
