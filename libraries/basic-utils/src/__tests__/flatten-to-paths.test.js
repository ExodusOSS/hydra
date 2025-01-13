import flattenToPaths from '../flatten-to-paths.js'

describe('flattenToPaths', () => {
  it('should return object as array of paths', () => {
    const accountStateByAssetSource = {
      exodus_0: {
        ethereum: 'An account state',
      },
      exodus_1: {
        bitcoin: 'Another account state',
        dash: 'Dash account state',
      },
    }
    const result = flattenToPaths(accountStateByAssetSource)

    expect(result).toEqual([
      ['exodus_0', 'ethereum', 'An account state'],
      ['exodus_1', 'bitcoin', 'Another account state'],
      ['exodus_1', 'dash', 'Dash account state'],
    ])
  })

  it('should be able to flatten non-uniform object', () => {
    const accountStateByAssetSource = {
      exodus_0: {
        ethereum: 'An account state',
      },
      exodus_1: 'I refuse to be the same as everyone else',
    }
    const result = flattenToPaths(accountStateByAssetSource)

    expect(result).toEqual([
      ['exodus_0', 'ethereum', 'An account state'],
      ['exodus_1', 'I refuse to be the same as everyone else'],
    ])
  })

  it('should flatten an empty object to an empty array', () => {
    expect(flattenToPaths({})).toEqual([])
  })

  it('should flatten null/undefined to an empty array', () => {
    expect(flattenToPaths(null)).toEqual([])
    expect(flattenToPaths()).toEqual([])
  })
})
