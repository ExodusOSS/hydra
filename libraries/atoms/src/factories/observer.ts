import type { ReadonlyAtom, Port, Unsubscribe } from '../utils/types.js'

type Params<T> = {
  atom: ReadonlyAtom<T>
  port: Port<T>
  event: string
  immediateRegister?: boolean
}

const createAtomObserver = <T>({ port, atom, event, immediateRegister = true }: Params<T>) => {
  let emitting = false
  let unobserve: Unsubscribe | undefined
  let lastMessage = -1

  const register = () => {
    if (unobserve) return

    unobserve = atom.observe((value) => {
      if (emitting) {
        port.emit(event, value)
        lastMessage = Date.now()
      }
    })
  }

  const unregister = () => {
    unobserve?.()
    unobserve = undefined
    emitting = false
  }

  const emitWhenReady = async () => {
    emitting = true
    const startTime = Date.now()
    const value = await atom.get()
    if (startTime > lastMessage) port.emit(event, value)
  }

  const start = () => {
    // Awaiting the atom.get() promise might delay the lifecycle hooks, so we don't do that.
    void emitWhenReady()
  }

  if (immediateRegister) {
    register()
  }

  return {
    register,
    unregister,
    start,
  }
}

export default createAtomObserver
