import { resolveUnusedAddressIndexesFromAddresses } from '../../module/utils.js'

describe('resolveUnusedAddressIndexesFromAddresses', () => {
  it('should return empty chains when no addresses are provided', () => {
    const addresses = []
    const purposes = [44, 49]

    expect(
      resolveUnusedAddressIndexesFromAddresses({
        addresses,
        purposes,
        highestUnusedIndexes: true,
      })
    ).toEqual([
      { purpose: 44, chain: [0, 0] },
      { purpose: 49, chain: [0, 0] },
    ])

    expect(
      resolveUnusedAddressIndexesFromAddresses({
        addresses,
        purposes,
        highestUnusedIndexes: false,
      })
    ).toEqual([
      { purpose: 44, chain: [0, 0] },
      { purpose: 49, chain: [0, 0] },
    ])
  })

  it('should correctly calculate unused indexes 1', () => {
    const addresses = [
      { purpose: 44, chainIndex: 0, addressIndex: 0 },
      { purpose: 44, chainIndex: 0, addressIndex: 4 },
      { purpose: 44, chainIndex: 1, addressIndex: 1 },
    ]
    const purposes = [44]

    expect(
      resolveUnusedAddressIndexesFromAddresses({
        addresses,
        purposes,
        highestUnusedIndexes: true,
      })
    ).toEqual([{ purpose: 44, chain: [5, 2] }])

    expect(
      resolveUnusedAddressIndexesFromAddresses({
        addresses,
        purposes,
        highestUnusedIndexes: false,
      })
    ).toEqual([{ purpose: 44, chain: [1, 0] }])
  })

  it('should correctly calculate unused indexes 2', () => {
    const addresses = [
      { purpose: 44, chainIndex: 0, addressIndex: 0 },
      { purpose: 44, chainIndex: 0, addressIndex: 1 },
      { purpose: 44, chainIndex: 1, addressIndex: 0 },
      { purpose: 44, chainIndex: 1, addressIndex: 1 },
    ]
    const purposes = [44]

    expect(
      resolveUnusedAddressIndexesFromAddresses({
        addresses,
        purposes,
        highestUnusedIndexes: false,
      })
    ).toEqual([{ purpose: 44, chain: [2, 2] }])

    expect(
      resolveUnusedAddressIndexesFromAddresses({
        addresses,
        purposes,
        highestUnusedIndexes: true,
      })
    ).toEqual([{ purpose: 44, chain: [2, 2] }])
  })

  it('should handle multiple purposes and chain indexes correctly', () => {
    const addresses = [
      { purpose: 44, chainIndex: 0, addressIndex: 1 },
      { purpose: 44, chainIndex: 1, addressIndex: 0 },
      { purpose: 49, chainIndex: 0, addressIndex: 2 },
    ]
    const purposes = [44, 49, 84]

    expect(
      resolveUnusedAddressIndexesFromAddresses({
        addresses,
        purposes,
        highestUnusedIndexes: false,
      })
    ).toEqual([
      { purpose: 44, chain: [0, 1] },
      { purpose: 49, chain: [0, 0] },
      { purpose: 84, chain: [0, 0] },
    ])

    expect(
      resolveUnusedAddressIndexesFromAddresses({
        addresses,
        purposes,
        highestUnusedIndexes: true,
      })
    ).toEqual([
      { purpose: 44, chain: [2, 1] },
      { purpose: 49, chain: [3, 0] },
      { purpose: 84, chain: [0, 0] },
    ])
  })
})
