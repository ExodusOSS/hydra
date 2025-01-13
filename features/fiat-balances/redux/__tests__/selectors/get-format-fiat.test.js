import { setup } from '../utils'

describe('getFormatFiat', () => {
  test('formats', () => {
    const { store, selectors } = setup({ currency: 'USD' })

    const formatFiat = selectors.fiatBalances.getFormatFiat(store.getState())

    expect(formatFiat(99)).toBe('$99.00')
  })

  test('formats currency with right symbol', () => {
    const { store, selectors } = setup({ currency: 'AED' })

    const formatFiat = selectors.fiatBalances.getFormatFiat(store.getState())

    expect(formatFiat(42)).toBe('42.00 AED')
  })
  test('formats zero as $0', () => {
    const { store, selectors } = setup({ currency: 'USD' })

    const formatFiat = selectors.fiatBalances.getFormatFiat(store.getState())

    expect(formatFiat(0)).toBe('$0')
  })
  test('formats zero as $0.00 if use adaptiveFraction', () => {
    const { store, selectors } = setup({ currency: 'USD' })

    const formatFiat = selectors.fiatBalances.getFormatFiat(store.getState())

    expect(formatFiat(0, { adaptiveFraction: true })).toBe('$0')
    expect(formatFiat(0.001, { adaptiveFraction: true })).toBe('$0.001')
    expect(formatFiat(0.0001, { adaptiveFraction: true })).toBe('$0.0001')
    expect(formatFiat(0.000_000_1, { adaptiveFraction: true })).toBe('$0')
  })

  test('formats dust fiat value to 0 with AED', () => {
    const { store, selectors } = setup({ currency: 'AED' })

    const formatFiat = selectors.fiatBalances.getFormatFiat(store.getState())

    expect(formatFiat(0.001)).toBe('0 AED')
  })
  test('formats dust fiat value to 0 with USD', () => {
    const { store, selectors } = setup({ currency: 'USD' })

    const formatFiat = selectors.fiatBalances.getFormatFiat(store.getState())

    expect(formatFiat(0.001)).toBe('$0')
    expect(formatFiat(0.0001)).toBe('$0')
    expect(formatFiat(0.001, { convertDust: false })).toBe('$0')
    expect(formatFiat(0.001, { adaptiveFraction: true })).toBe('$0.001')
    expect(formatFiat(0.0001, { adaptiveFraction: true })).toBe('$0.0001')
    expect(formatFiat(0.000_01, { adaptiveFraction: true })).toBe('$0.00001')
    expect(formatFiat(0.000_001, { adaptiveFraction: true })).toBe('$0.000001')
    expect(formatFiat(0.000_000_1, { adaptiveFraction: true })).toBe('$0')
  })
})
