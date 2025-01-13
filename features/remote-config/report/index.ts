import type { Definition } from '@exodus/dependency-types'
import type { Atom } from '@exodus/atoms'

import { RemoteConfigStatus } from '../atoms'

const createRemoteConfigReport = ({
  remoteConfigStatusAtom,
}: {
  remoteConfigStatusAtom: Atom<RemoteConfigStatus>
}) => ({
  namespace: 'remoteConfig',
  export: async (): Promise<RemoteConfigStatus> => remoteConfigStatusAtom.get(),
})

const remoteConfigReportDefinition = {
  id: 'remoteConfigReport',
  type: 'report',
  factory: createRemoteConfigReport,
  dependencies: ['remoteConfigStatusAtom'],
  public: true,
} as const satisfies Definition

export default remoteConfigReportDefinition
