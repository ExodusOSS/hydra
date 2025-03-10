import { createInMemoryAtom } from '@exodus/atoms'

import errorTrackingReportDefinition from '../index.js'

describe('errorTrackingReport', () => {
  const errors = [
    { namespace: 'space1', error: new Error('1'), context: {}, time: Date.now() },
    { namespace: 'space1', error: new Error('2'), context: {}, time: Date.now() },
    { namespace: 'space1', error: new Error('3'), context: {}, time: Date.now() },
    { namespace: 'space2', error: new Error('1'), context: {}, time: Date.now() },
    { namespace: 'space2', error: new Error('2'), context: {}, time: Date.now() },
    { namespace: 'space2', error: new Error('3'), context: {}, time: Date.now() },
  ]

  it('should setup correctly', async () => {
    const errorsAtom = createInMemoryAtom({ defaultValue: { errors } })

    const report = errorTrackingReportDefinition.factory({
      errorsAtom,
    })

    expect(report.export).toBeDefined()
  })

  it('should export empty array on empty data', async () => {
    const errorsAtom = createInMemoryAtom({ defaultValue: { errors: [] } })

    const report = errorTrackingReportDefinition.factory({
      errorsAtom,
    })

    const result = await report.export({ walletExists: true })

    expect(typeof result).toBe('object')
    expect(Array.isArray(result.errors)).toBe(true)
    expect(result.errors.length).toEqual(0)
  })

  it('should export all errors array, keying by namespace', async () => {
    const errorsAtom = createInMemoryAtom({ defaultValue: { errors } })

    const report = errorTrackingReportDefinition.factory({
      errorsAtom,
    })

    const result = await report.export({ walletExists: true })

    expect(typeof result).toBe('object')
    expect(Array.isArray(result.errors)).toEqual(true)
    expect(result.errors[0].error.name).toEqual('Error')
    expect(result.errors[2].error.name).toEqual('Error')
  })
})
