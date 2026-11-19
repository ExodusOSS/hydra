import type { Atom } from '@exodus/atoms'
import { createInMemoryAtom } from '@exodus/atoms'
import type { Storage } from '@exodus/storage-interface'

import applicationReduxDefinition from '../../redux/index.js'
import type { State } from '../../redux/types.js'
import type { EventLog, Wallet } from '../../utils/types.js'
import { Application } from '../application.js'

const { initialState, eventReducers } = applicationReduxDefinition

const createDeferred = <T>() => {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve
    reject = _reject
  })

  return { promise, resolve, reject }
}

const createMemoryStorage = (): Storage => {
  const store = new Map<string, unknown>()
  const make = (prefix: string): Storage =>
    ({
      get: async (key: string) => store.get(`${prefix}${key}`),
      batchGet: async (keys: string[]) => keys.map((key) => store.get(`${prefix}${key}`)),
      set: async (key: string, value: unknown) => {
        store.set(`${prefix}${key}`, value)
      },
      batchSet: async (entries: Record<string, unknown>) => {
        for (const [key, value] of Object.entries(entries)) store.set(`${prefix}${key}`, value)
      },
      delete: async (key: string) => {
        store.delete(`${prefix}${key}`)
      },
      batchDelete: async (keys: string[]) => {
        for (const key of keys) store.delete(`${prefix}${key}`)
      },
      clear: async () => {
        for (const key of store.keys()) {
          if (key.startsWith(prefix)) store.delete(key)
        }
      },
      namespace: (sub: string) => make(`${prefix}${sub}!`),
    }) as unknown as Storage

  return make('')
}

const noopLogger = {
  log: () => {},
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
} as any

const noopEventLog: EventLog = {
  record: async () => {},
  remove: async () => {},
  exportFormatted: async () => [],
  clear: async () => {},
  getVersionHistory: async () => [],
  isEmpty: async () => true,
}

const noopErrorTracking = { track: async () => {} }

type TestWallet = Wallet & {
  setIsLockedSnapshot: (value: boolean | Promise<boolean>) => void
}

const createWallet = ({ isLocked: initialIsLocked }: { isLocked: boolean }): TestWallet => {
  let isLockedReturnValue: boolean | Promise<boolean> = initialIsLocked
  return {
    create: async () => ({}),
    import: async () => ({}),
    getMnemonic: async () => '',
    lock: async () => {
      isLockedReturnValue = true
    },
    unlock: async () => {
      isLockedReturnValue = false
    },
    isLocked: async () => isLockedReturnValue,
    hasPassphraseSet: async () => true,
    clear: async () => {},
    exists: async () => true,
    changePassphrase: async () => {},
    setIsLockedSnapshot: (value) => {
      isLockedReturnValue = value
    },
  } as TestWallet
}

const wireRedux = (application: Application) => {
  let state: State = { ...initialState }
  const dispatch = <K extends keyof typeof eventReducers>(
    name: K,
    payload?: Parameters<(typeof eventReducers)[K]>[1]
  ) => {
    const reducer = eventReducers[name] as (s: State, p: unknown) => State
    state = reducer(state, payload)
  }

  application.on('load', (payload: any) => dispatch('load', payload))
  application.on('unlock', () => dispatch('unlock'))
  application.on('lock', () => dispatch('lock'))

  return { getState: () => state }
}

const buildApplication = async () => {
  const wallet = createWallet({ isLocked: true })
  const lockedAtom: Atom<boolean> = createInMemoryAtom({ defaultValue: true })
  const backedUpAtom: Atom<boolean> = createInMemoryAtom({ defaultValue: true })

  const application = new Application({
    wallet,
    unsafeStorage: createMemoryStorage() as any,
    lockedAtom,
    backedUpAtom,
    logger: noopLogger,
    eventLog: noopEventLog,
    errorTracking: noopErrorTracking as any,
  } as any)

  const store = wireRedux(application)
  await application.start()
  return { application, wallet, store, lockedAtom }
}

describe('Application — stale load must not relock unlocked wallet', () => {
  // Reproduces the production race that left users stuck on the lock screen
  // on slow connections (originally observed via VPN to Vietnam):
  //
  // 1. application.load() is invoked while the wallet is still locked. It
  //    snapshots `wallet.isLocked() === true` and then awaits firing
  //    Hook.Load.
  // 2. Before Hook.Load fires, application.unlock() runs to completion: the
  //    wallet flips to unlocked, Hook.Unlock fires, the redux subscriber
  //    receives `unlock` and `isLocked` becomes `false`.
  // 3. application.load() resumes and fires Hook.Load with the now-stale
  //    `isLocked: true` payload. The redux subscriber receives `pre-load` /
  //    `load` and overwrites `isLocked` back to `true`.
  //
  // After this the UI has no way to recover until the user manually
  // locks/unlocks again.
  it('keeps isLocked: false when a stale load resolves after unlock', async () => {
    const { application, wallet, store } = await buildApplication()

    // Make the next isLocked() call hang so we can interleave unlock() in
    // between the snapshot and Hook.Load firing.
    const deferred = createDeferred<boolean>()
    wallet.setIsLockedSnapshot(deferred.promise)

    const loadPromise = application.load()

    // Let load() reach Promise.all and block on isLocked().
    await Promise.resolve()
    await Promise.resolve()

    // Restore a fast isLocked() for unlock()'s internal use, then run unlock.
    wallet.setIsLockedSnapshot(false)
    await application.unlock({ passphrase: 'pw' })

    expect(store.getState().isLocked).toBe(false)

    // Now resolve the in-flight load() snapshot with the stale value the
    // production code would have read before unlock landed.
    deferred.resolve(true)
    await loadPromise

    expect(store.getState().isLocked).toBe(false)
  })
})
