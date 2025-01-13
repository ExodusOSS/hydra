import { applicationNameToBaseAssetNames } from '../index'

describe('applicationNameToBaseAssetNames()', () => {
  it.each([
    {
      applicationName: 'Ethereum',
      expectedAssetNames: ['ethereum', 'basemainnet', 'matic', 'ethereumsepolia'],
    },
    {
      applicationName: 'Bitcoin',
      expectedAssetNames: ['bitcoin', 'bitcointestnet', 'bitcoinregtest'],
    },
    {
      applicationName: 'Solana',
      expectedAssetNames: ['solana'],
    },
    {
      applicationName: 'Polygon',
      expectedAssetNames: ['matic'],
    },
  ])(
    'should resolve $applicationName to $expectedAssetNames',
    ({ applicationName, expectedAssetNames }) => {
      expect(applicationNameToBaseAssetNames[applicationName]).toEqual(expectedAssetNames)
    }
  )
})
