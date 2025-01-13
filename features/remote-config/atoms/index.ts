import { createInMemoryAtom } from '@exodus/atoms'
import type { Definition } from '@exodus/dependency-types'

export type RemoteConfigStatus = {
  error: string | null
  remoteConfigUrl: string | null
  loaded: boolean
}
const initialState: RemoteConfigStatus = {
  remoteConfigUrl: null,
  error: null,
  loaded: false,
}

const remoteConfigStatusAtomDefinition = {
  id: 'remoteConfigStatusAtom',
  type: 'atom',
  factory: () => createInMemoryAtom<RemoteConfigStatus>({ defaultValue: initialState }),
  dependencies: [],
} as const satisfies Definition

export default remoteConfigStatusAtomDefinition
