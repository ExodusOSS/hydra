import { createInMemoryAtom } from '@exodus/atoms'
import type { Definition } from '@exodus/dependency-types'

export type RemoteConfigStatus = {
  remoteConfigUrl: string | null
  loaded: boolean
  gitHash: string | null
}
const initialState: RemoteConfigStatus = {
  remoteConfigUrl: null,
  loaded: false,
  gitHash: null,
}

const remoteConfigStatusAtomDefinition = {
  id: 'remoteConfigStatusAtom',
  type: 'atom',
  factory: () => createInMemoryAtom<RemoteConfigStatus>({ defaultValue: initialState }),
  dependencies: [],
} as const satisfies Definition

export default remoteConfigStatusAtomDefinition
