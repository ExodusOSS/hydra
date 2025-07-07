import { createInMemoryAtom } from '@exodus/atoms'

import type { RemoteConfigStatus } from '../atoms/index.js'
import remoteConfigReportDefinition from './index.js'

describe('remoteConfigReport', () => {
  const data: RemoteConfigStatus = {
    remoteConfigUrl: 'https://fake.url/remote-config.json',
    loaded: false,
    gitHash: null,
  }

  const remoteConfigStatusAtom = createInMemoryAtom({ defaultValue: data })
  const report = remoteConfigReportDefinition.factory({ remoteConfigStatusAtom })

  it('should setup correctly', () => {
    expect(report.export).toBeDefined()
    expect(report.namespace).toBe('remoteConfig')
  })

  it('should export load status to the report', async () => {
    const reportData = report.getSchema().parse(await report.export())
    expect(reportData).toEqual(data)
  })

  it('should export load status to the report (happy case)', async () => {
    const data: RemoteConfigStatus = {
      remoteConfigUrl: 'https://fake.url/remote-config.json',
      loaded: true,
      gitHash: 'c2c22',
    }
    const remoteConfigStatusAtom = createInMemoryAtom({ defaultValue: data })
    const report = remoteConfigReportDefinition.factory({ remoteConfigStatusAtom })

    const reportData = report.getSchema().parse(await report.export())
    expect(reportData).toEqual(data)
  })
})
