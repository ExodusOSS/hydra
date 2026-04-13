import { createInMemoryAtom } from '@exodus/atoms'

import type { RemoteConfigData } from '../types/index.js'
import type { RemoteConfigReportData } from './index.js'
import remoteConfigReportDefinition from './index.js'

describe('remoteConfigReport', () => {
  const data: RemoteConfigData = {
    remoteConfigUrl: 'https://fake.url/remote-config.json',
  }

  const remoteConfigAtom = createInMemoryAtom({ defaultValue: data })
  const report = remoteConfigReportDefinition.factory({ remoteConfigAtom })

  it('should setup correctly', () => {
    expect(report.export).toBeDefined()
    expect(report.namespace).toBe('remoteConfig')
  })

  it('should export load status to the report', async () => {
    const expected: RemoteConfigReportData = {
      remoteConfigUrl: data.remoteConfigUrl,
      loaded: false,
    }
    const reportData = report.getSchema().parse(await report.export())
    expect(reportData).toEqual(expected)
  })

  it('should export load status to the report (happy case)', async () => {
    const data: RemoteConfigData = {
      remoteConfigUrl: 'https://fake.url/remote-config.json',
      config: { meta: { gitHash: 'c2c22' } },
    }
    const expected: RemoteConfigReportData = {
      remoteConfigUrl: data.remoteConfigUrl,
      loaded: true,
      gitHash: data.config?.meta.gitHash,
    }
    const remoteConfigAtom = createInMemoryAtom({ defaultValue: data })
    const report = remoteConfigReportDefinition.factory({ remoteConfigAtom })

    const reportData = report.getSchema().parse(await report.export())
    expect(reportData).toEqual(expected)
  })
})
