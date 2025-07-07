import type { Definition } from '@exodus/dependency-types'
import type { Atom } from '@exodus/atoms'
import { z } from '@exodus/zod'
import { memoize } from '@exodus/basic-utils'

import type { RemoteConfigStatus } from '../atoms/index.js'

const createRemoteConfigReport = ({
  remoteConfigStatusAtom,
}: {
  remoteConfigStatusAtom: Atom<RemoteConfigStatus>
}) => ({
  namespace: 'remoteConfig',
  export: async (): Promise<RemoteConfigStatus> => remoteConfigStatusAtom.get(),
  getSchema: memoize(() =>
    z
      .object({
        remoteConfigUrl: z.string().nullish(),
        loaded: z.boolean(),
        gitHash: z
          .string()
          .regex(/^[\da-f]{5,40}$/u)
          .nullish(),
      })
      .strict()
  ),
})

const remoteConfigReportDefinition = {
  id: 'remoteConfigReport',
  type: 'report',
  factory: createRemoteConfigReport,
  dependencies: ['remoteConfigStatusAtom'],
  public: true,
} as const satisfies Definition

export default remoteConfigReportDefinition
