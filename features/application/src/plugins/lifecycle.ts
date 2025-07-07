import type { Atom, ReadonlyAtom } from '@exodus/atoms'
import { createAtomObserver } from '@exodus/atoms'
import type Emitter from '@exodus/wild-emitter'
import type { LockHistoryEntry } from '../utils/types.js'
import type { Definition } from '@exodus/dependency-types'

type Params = {
  port: Emitter<string, boolean | number | LockHistoryEntry | string>
  lockedAtom: ReadonlyAtom<boolean>
  lockHistoryAtom: ReadonlyAtom<LockHistoryEntry>
  restoreAtom: Atom<boolean>
  backedUpAtom: Atom<boolean | undefined>
  autoLockTimerAtom: Atom<number | undefined>
  walletCreatedAtAtom: Atom<string | undefined>
}

const applicationLifecyclePlugin = ({
  port,
  lockedAtom,
  lockHistoryAtom,
  restoreAtom,
  backedUpAtom,
  autoLockTimerAtom,
  walletCreatedAtAtom,
}: Params) => {
  const observers = [
    createAtomObserver({ port, atom: lockedAtom, event: 'locked' }),
    createAtomObserver({ port, atom: lockHistoryAtom, event: 'lockHistory' }),
    createAtomObserver({ port, atom: restoreAtom, event: 'restore' }),
    createAtomObserver({ port, atom: backedUpAtom, event: 'backedUp' }),
    createAtomObserver({ port, atom: autoLockTimerAtom, event: 'autoLockTimer' }),
    createAtomObserver({ port, atom: walletCreatedAtAtom, event: 'walletCreatedAt' }),
  ]

  const onStart = ({ isRestoring }: { isRestoring: boolean }) => {
    void restoreAtom.set(isRestoring)
  }

  const onLoad = async () => {
    observers.forEach((observer) => observer.start())
  }

  const onImport = () => {
    void backedUpAtom.set(true)
    void restoreAtom.set(true)
  }

  const onAddSeed = () => {
    void restoreAtom.set(true)
  }

  const onAssetsSynced = async () => {
    void restoreAtom.set(false)
  }

  const onStop = () => {
    observers.forEach((observer) => observer.unregister())
  }

  const onClear = async () => {
    await Promise.all([backedUpAtom.set(undefined), autoLockTimerAtom.set(undefined)])
  }

  return { onStart, onLoad, onImport, onAssetsSynced, onStop, onClear, onAddSeed }
}

const applicationLifecyclePluginDefinition = {
  id: 'applicationLifecyclePlugin',
  type: 'plugin',
  factory: applicationLifecyclePlugin,
  dependencies: [
    'port',
    'lockedAtom',
    'lockHistoryAtom',
    'restoreAtom',
    'backedUpAtom',
    'autoLockTimerAtom',
    'walletCreatedAtAtom',
  ],
  public: true,
} as const satisfies Definition

export default applicationLifecyclePluginDefinition
