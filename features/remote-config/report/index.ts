import type { Definition } from '@exodus/dependency-types'
import type { Atom } from '@exodus/atoms'
import { z } from '@exodus/zod'
import { memoize } from '@exodus/basic-utils'

import type { RemoteConfigData } from '../types/index.js'

export type RemoteConfigReportData = {
  remoteConfigUrl?: string | null
  loaded: boolean
  gitHash?: string | null
}

const createRemoteConfigReport = ({
  remoteConfigAtom,
}: {
  remoteConfigAtom: Atom<RemoteConfigData>
}) => ({
  namespace: 'remoteConfig',
  export: async (): Promise<RemoteConfigReportData> => {
    const { remoteConfigUrl, config } = await remoteConfigAtom.get()
    return { loaded: Boolean(config), remoteConfigUrl, gitHash: config?.meta?.gitHash }
  },
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
  dependencies: ['remoteConfigAtom'],
  public: true,
} as const satisfies Definition

export default remoteConfigReportDefinition
