import { createStorageAtomFactory } from '@exodus/atoms'
import type { Definition } from '@exodus/dependency-types'
import type { Storage } from '@exodus/storage-interface'

const STORAGE_KEY = 'remoteConfigAtom'
const DEFAULT_VALUE = {}

const createRemoteConfigAtom = ({ storage }: { storage: Storage }) => {
  const createStorageAtom = createStorageAtomFactory({ storage })
  return createStorageAtom({ key: STORAGE_KEY, defaultValue: DEFAULT_VALUE })
}

const remoteConfigAtomDefinition = {
  id: 'remoteConfigAtom',
  type: 'atom',
  factory: createRemoteConfigAtom,
  dependencies: ['storage'],
  public: true,
} as const satisfies Definition

export default remoteConfigAtomDefinition
