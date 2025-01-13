import balances from '../index.js'

describe('balances', () => {
  it('should not throw when receiving valid config', () => {
    expect(() => balances({ balanceFields: ['balance'] })).not.toThrow()
  })

  it('should not throw if config is missing "balanceFields"', () => {
    expect(() => balances({})).not.toThrow()
  })

  it('should throw if "balanceFields" contains non-string values', () => {
    expect(() => balances({ balanceFields: [2, 'balance'] })).toThrow(
      /Expected property "balanceFields.0" of type String, got Number 2/
    )
  })
})
