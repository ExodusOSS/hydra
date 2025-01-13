import { createInMemoryAtom } from '@exodus/atoms'
import remoteConfigReportDefinition from './index'
import { RemoteConfigStatus } from '../atoms'

describe('remoteConfigReport', () => {
  const data: RemoteConfigStatus = {
    remoteConfigUrl: 'https://fake.url/remote-config.json',
    error: 'some error',
    loaded: false,
  }

  const remoteConfigStatusAtom = createInMemoryAtom({ defaultValue: data })
  const report = remoteConfigReportDefinition.factory({ remoteConfigStatusAtom })

  it('should setup correctly', () => {
    expect(report.export).toBeDefined()
    expect(report.namespace).toBe('remoteConfig')
  })

  it('should export load status to the report', async () => {
    const reportData = await report.export()
    expect(reportData).toEqual(data)
  })
})
