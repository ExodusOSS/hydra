/* eslint-disable sonarjs/no-identical-functions */

import type { State } from './types.js'
import type { LockHistoryEntry } from '../utils/types.js'

type EventReducer<T = undefined> = (state: State, payload: T) => State

type HookPayload = {
  isLocked: boolean
  walletExists: boolean
  hasPassphraseSet: boolean
  isRestoring: boolean
}

const preLoad: EventReducer<HookPayload> = (state, payload) => ({
  ...state,
  isLocked: payload.isLocked,
  walletExists: payload.walletExists,
  hasPassphraseSet: payload.hasPassphraseSet,
  isRestoring: payload.isRestoring,
})

const load: EventReducer<HookPayload> = (state, payload) => ({
  ...state,
  isLoading: false,
  isLocked: payload.isLocked,
  walletExists: payload.walletExists,
  hasPassphraseSet: payload.hasPassphraseSet,
  isRestoring: payload.isRestoring,
})

const create: EventReducer<HookPayload> = (state, payload) => ({
  ...state,
  isLoading: false,
  isLocked: payload.isLocked,
  walletExists: payload.walletExists,
  hasPassphraseSet: payload.hasPassphraseSet,
  isRestoring: payload.isRestoring,
})

const importCompleted: EventReducer<{ walletExists: boolean }> = (state, payload) => ({
  ...state,
  isLoading: false,
  walletExists: payload.walletExists,
})

const lock: EventReducer = (state) => ({
  ...state,
  isLocked: true,
})

const unlock: EventReducer = (state) => ({
  ...state,
  isLocked: false,
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
  walletExists: state.walletExists || Boolean(payload),
  isRestoring: payload,
})

const restoreCompleted: EventReducer = (state) => ({
  ...state,
  isRestoring: false,
})

const passphraseChanged: EventReducer = (state) => ({
  ...state,
  hasPassphraseSet: true,
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
  'pre-load': preLoad,
  load,
  create,
  'import-completed': importCompleted,
  lock,
  unlock,
  backedUp,
  backup,
  restore,
  'restore-completed': restoreCompleted,
  'passphrase-changed': passphraseChanged,
  lockHistory,
  autoLockTimer,
  walletCreatedAt,
}

export default eventReducers
