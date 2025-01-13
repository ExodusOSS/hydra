import type { Atom, ReadonlyAtom } from '@exodus/atoms'
import { createAtomObserver } from '@exodus/atoms'
import type Emitter from '@exodus/wild-emitter'
import type { LockHistoryEntry } from '../utils/types.js'
import type { Definition } from '@exodus/dependency-types'

type Params = {
  port: Emitter<string, boolean | number | LockHistoryEntry>
  lockedAtom: ReadonlyAtom<boolean>
  lockHistoryAtom: ReadonlyAtom<LockHistoryEntry>
  restoreAtom: Atom<boolean>
  backedUpAtom: Atom<boolean | undefined>
  autoLockTimerAtom: Atom<number | undefined>
}

const applicationLifecyclePlugin = ({
  port,
  lockedAtom,
  lockHistoryAtom,
  restoreAtom,
  backedUpAtom,
  autoLockTimerAtom,
}: Params) => {
  const observers = [
    createAtomObserver({ port, atom: lockedAtom, event: 'locked' }),
    createAtomObserver({ port, atom: lockHistoryAtom, event: 'lockHistory' }),
    createAtomObserver({ port, atom: restoreAtom, event: 'restore' }),
    createAtomObserver({ port, atom: backedUpAtom, event: 'backedUp' }),
    createAtomObserver({ port, atom: backedUpAtom, event: 'backedUp' }),
    createAtomObserver({ port, atom: autoLockTimerAtom, event: 'autoLockTimer' }),
  ]

  const onStart = ({ isRestoring }: { isRestoring: boolean }) => {
    restoreAtom.set(isRestoring)
  }

  const onLoad = async () => {
    observers.forEach((observer) => observer.start())
  }

  const onImport = () => {
    backedUpAtom.set(true)
    restoreAtom.set(true)
  }

  const onAddSeed = () => {
    restoreAtom.set(true)
  }

  const onAssetsSynced = async () => {
    restoreAtom.set(false)
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
  ],
  public: true,
} as const satisfies Definition

export default applicationLifecyclePluginDefinition
