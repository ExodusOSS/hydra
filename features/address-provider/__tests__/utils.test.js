import { createPath } from '../module/utils.js'

describe('createPath', () => {
  it('should create a path for given chainIndex and addressIndex', () => {
    const result = createPath({ chainIndex: 2, addressIndex: 3 })
    expect(result).toBe('m/2/3')
  })

  it('should create a path for given chainIndex only', () => {
    const result = createPath({ chainIndex: 2 })
    expect(result).toBe('m/2')
  })

  it('should not include undefined or null values in the path', () => {
    const result = createPath({ chainIndex: 2, addressIndex: undefined })
    expect(result).toBe('m/2')
  })

  it('should throw an error if chainIndex is undefined and addressIndex is defined', () => {
    expect(() => createPath({ addressIndex: 3 })).toThrow(
      'chainIndex must be provided if addressIndex is provided'
    )
  })
})
