import type { State } from './types.js'
import type { LockHistoryEntry } from '../utils/types.js'

type EventReducer<T = void> = (state: State, payload: T) => State

const load: EventReducer = (state) => ({
  ...state,
  isLoading: false,
})

const create: EventReducer = (state) => ({
  ...state,
  isLoading: false,
})

const importCompleted: EventReducer = (state) => ({
  ...state,
  isLoading: false,
})

const lock: EventReducer = (state) => ({
  ...state,
  isLocked: true,
})

const unlock: EventReducer = (state) => ({
  ...state,
  isLocked: false,
})

const locked: EventReducer<boolean> = (state, payload) => ({
  ...state,
  isLocked: payload,
})

const walletExists: EventReducer<boolean> = (state, payload) => ({
  ...state,
  walletExists: payload,
})

const hasPassphraseSet: EventReducer<boolean> = (state, payload) => ({
  ...state,
  hasPassphraseSet: payload,
})

const backedUp: EventReducer<boolean> = (state, payload) => ({
  ...state,
  isBackedUp: payload,
})

const backup: EventReducer = (state) => ({
  ...state,
  isBackedUp: true,
})

const restore: EventReducer<boolean> = (state, payload) => ({
  ...state,
  isRestoring: payload,
})

const restoreCompleted: EventReducer = (state) => ({
  ...state,
  isRestoring: false,
})

const lockHistory: EventReducer<LockHistoryEntry[]> = (state, payload) => ({
  ...state,
  lockHistory: payload.filter((it) => it.locked),
})

const autoLockTimer: EventReducer<number> = (state: State, payload: number) => ({
  ...state,
  autoLockTimer: payload,
})

const walletCreatedAt: EventReducer<string> = (state: State, payload: string) => ({
  ...state,
  walletCreatedAt: payload,
})

const eventReducers = {
  load,
  create,
  'import-completed': importCompleted,
  lock,
  unlock,
  locked,
  walletExists,
  hasPassphraseSet,
  backedUp,
  backup,
  restore,
  'restore-completed': restoreCompleted,
  lockHistory,
  autoLockTimer,
  walletCreatedAt,
}

export default eventReducers
