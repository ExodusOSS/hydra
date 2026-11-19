import { shallowMerge, snakeCase } from '../utils.js'

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

describe('shallowMerge', () => {
  it('should snake_case keys by default', () => {
    const result = shallowMerge({}, { camelCase: 'value', PascalCase: 'value2' })
    expect(result).toEqual({ camel_case: 'value', pascal_case: 'value2' })
  })

  it('should merge with existing object', () => {
    const result = shallowMerge({ existing: 'value' }, { newKey: 'newValue' })
    expect(result).toEqual({ existing: 'value', new_key: 'newValue' })
  })

  it('should preserve keys specified in preserveKeys', () => {
    const result = shallowMerge(
      {},
      { 'Experiment name': 'test', 'Variant name': 'control', otherKey: 'value' },
      { preserveKeys: ['Experiment name', 'Variant name'] }
    )
    expect(result).toEqual({
      'Experiment name': 'test',
      'Variant name': 'control',
      other_key: 'value',
    })
  })

  it('should snake_case keys not in preserveKeys', () => {
    const result = shallowMerge(
      {},
      { preservedKey: 'a', notPreserved: 'b' },
      { preserveKeys: ['preservedKey'] }
    )
    expect(result).toEqual({ preservedKey: 'a', not_preserved: 'b' })
  })

  it('should handle empty preserveKeys array', () => {
    const result = shallowMerge({}, { camelCase: 'value' }, { preserveKeys: [] })
    expect(result).toEqual({ camel_case: 'value' })
  })
})
