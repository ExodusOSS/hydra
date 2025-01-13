import createBackedUpAtom from './backed-up.js'
import { createWalletCreatedAtAtom } from './created-at.js'
import createLockHistoryAtom from './lock-history.js'
import createdLockedAtom from './locked.js'
import createRestoreAtom from './restore.js'
import createAutoLockTimerAtom from './auto-lock-timer.js'
import type { Definition } from '@exodus/dependency-types'

export const lockedAtomDefinition = {
  id: 'lockedAtom',
  type: 'atom',
  factory: createdLockedAtom,
  dependencies: [],
  public: true,
} as const satisfies Definition

export const lockHistoryAtomDefinition = {
  id: 'lockHistoryAtom',
  type: 'atom',
  factory: createLockHistoryAtom,
  dependencies: ['lockedAtom'],
  public: true,
} as const satisfies Definition

export const restoreAtomDefinition = {
  id: 'restoreAtom',
  type: 'atom',
  factory: createRestoreAtom,
  dependencies: [],
  public: true,
} as const satisfies Definition

export const backedUpAtomDefinition = {
  id: 'backedUpAtom',
  type: 'atom',
  factory: createBackedUpAtom,
  dependencies: ['storage'],
  public: true,
} as const satisfies Definition

export const walletCreatedAtAtomDefinition = {
  id: 'walletCreatedAtAtom',
  type: 'atom',
  factory: createWalletCreatedAtAtom,
  dependencies: ['fusion', 'logger'],
  public: true,
} as const satisfies Definition

export const autoLockTimerAtomDefinition = {
  type: 'atom',
  id: 'autoLockTimerAtom',
  factory: createAutoLockTimerAtom,
  dependencies: ['storage'],
  public: true,
} as const satisfies Definition
