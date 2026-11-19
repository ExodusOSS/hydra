import { bitcoin, dollar } from './_fixtures.js'

describe('ZERO', () => {
  it('should return a number-unit with value of 0 in default unit', () => {
    const b0 = bitcoin.ZERO
    expect(b0.toNumber()).toBe(0)
    expect(b0.unit.toString()).toBe('BTC')

    const d0 = dollar.ZERO
    expect(d0.toNumber()).toBe(0)
    expect(d0.unit.toString()).toBe('USD')
  })

  it('should return the same number-unit on each access', () => {
    expect(bitcoin.ZERO).toBe(bitcoin.ZERO)
  })
})
