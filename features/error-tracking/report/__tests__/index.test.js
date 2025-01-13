import { createInMemoryAtom } from '@exodus/atoms'
import errorTrackingReportDefinition from '../index.js'

describe('errorTrackingReport', () => {
  const errors = [
    { namespace: 'space1', error: '1', context: {}, time: Date.now() },
    { namespace: 'space1', error: '2', context: {}, time: Date.now() },
    { namespace: 'space1', error: '3', context: {}, time: Date.now() },
    { namespace: 'space2', error: '1', context: {}, time: Date.now() },
    { namespace: 'space2', error: '2', context: {}, time: Date.now() },
    { namespace: 'space2', error: '3', context: {}, time: Date.now() },
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

    const result = await report.export()

    expect(typeof result).toBe('object')
    expect(Array.isArray(result.errors)).toBe(true)
    expect(result.errors.length).toEqual(0)
  })

  it('should export all errors array, keying by namespace', async () => {
    const errorsAtom = createInMemoryAtom({ defaultValue: { errors } })

    const report = errorTrackingReportDefinition.factory({
      errorsAtom,
    })

    const result = await report.export()

    expect(typeof result).toBe('object')
    expect(Array.isArray(result.errors)).toEqual(true)
    expect(result.errors[0].error).toEqual('1')
    expect(result.errors[2].error).toEqual('3')
  })
})
