import { createInMemoryAtom } from '@exodus/atoms'

import analyticsReportDefinition from '../index.js'

describe('analyticsReport', () => {
  let analyticsUserIdAtom
  const userId = 'some id'

  beforeEach(() => {
    analyticsUserIdAtom = createInMemoryAtom({ defaultValue: userId })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should provide the correct namespace', async () => {
    const report = analyticsReportDefinition.factory({
      analyticsUserIdAtom,
    })

    expect(report.namespace).toEqual('analytics')
  })

  it('should report a userId', async () => {
    const report = analyticsReportDefinition.factory({
      analyticsUserIdAtom,
    })

    expect(report.getSchema().parse(await report.export({ walletExists: false }))).toEqual({
      userId: null,
    })
    expect(report.getSchema().parse(await report.export({ walletExists: true }))).toEqual({
      userId,
    })
    expect(
      report.getSchema().parse(await report.export({ walletExists: true, isLocked: true }))
    ).toEqual({
      userId: null,
    })
  })
})
