import type { LockHistoryEntry } from '../utils/types.js'

export type State = {
  isLoading: boolean
  isLocked: boolean
  isBackedUp: boolean
  walletExists: boolean
  hasPassphraseSet: boolean
  isRestoring: boolean
  lockHistory: LockHistoryEntry[]
  autoLockTimer: null | number
}
