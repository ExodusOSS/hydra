const { snakeCase } = require('../utils')

describe('snakecase', () => {
  it('should snakecase pascalCase values', () => {
    expect(snakeCase('hasNfts')).toBe('has_nfts')
  })

  it('should snakecase pascalCase with numeric value', () => {
    expect(snakeCase('assetSentLast90')).toBe('asset_sent_last_90')
  })

  it('should snakecase pascalCase with numeric value in middle', () => {
    expect(snakeCase('assetSent90Last')).toBe('asset_sent_90_last')
  })

  it('should leave snakecase value if passed', () => {
    expect(snakeCase('has_nfts')).toBe('has_nfts')
  })

  it('should leave snakecase value with number if passed', () => {
    expect(snakeCase('asset_sent_last_90')).toBe('asset_sent_last_90')
  })

  it('should leave snakecase value with number in middle if passed', () => {
    expect(snakeCase('asset_sent_90_last')).toBe('asset_sent_90_last')
  })
})
