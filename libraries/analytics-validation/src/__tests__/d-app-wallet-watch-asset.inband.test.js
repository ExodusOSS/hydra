import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'DappWalletWatchAsset',
    properties: {
      ...commonProps,
      dapp_domain: 'dextools.io',
      options: {
        address: '0x5026f006b85729a8b14553fae6af249ad16c9aab',
        decimals: 18,
        image:
          'https://www.dextools.io/resources/tokens/logos/3/ether/0x5026f006b85729a8b14553fae6af249ad16c9aab.png?1681821640',
        symbol: 'WOJAK',
      },
      type: 'ERC20',
    },
  },
]

describe('DappWalletWatchAsset', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "DappWalletWatchAsset" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "DappWalletWatchAsset" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "DappWalletWatchAsset" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
