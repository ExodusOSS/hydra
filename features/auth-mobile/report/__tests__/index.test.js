import { createInMemoryAtom } from '@exodus/atoms'

import authReportDefinition from '../index.js'

describe('authReport', () => {
  let authAtom

  beforeEach(() => {
    authAtom = createInMemoryAtom()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should provide the correct namespace', async () => {
    const report = authReportDefinition.factory({
      authAtom,
    })

    expect(report.namespace).toEqual('auth')
  })

  it('should report successfully', async () => {
    const report = authReportDefinition.factory({
      authAtom,
    })

    const newAuth = {
      hasPin: false,
      hasBioAuth: false,
      biometry: 'Touch ID',
    }
    await authAtom.set(newAuth)

    expect(report.getSchema().parse(await report.export({ walletExists: false }))).toEqual(null)
    expect(report.getSchema().parse(await report.export({ walletExists: true }))).toEqual(newAuth)
  })
})
