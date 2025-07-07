import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'DAppConnectionRequest',
    properties: {
      ...commonProps,
      approved: true,
      connection_origin: 'default',
      dapp_domain: 'stake.lido.fi',
    },
  },
  {
    event: 'DAppConnectionRequest',
    properties: {
      ...commonProps,
      approved: true,
      connection_origin: 'default',
      connection_protocol: 'Solana Mobile Wallet Adapter',
    },
  },
]

describe('DAppConnectionRequest', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "DAppConnectionRequest" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "DAppConnectionRequest" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "DAppConnectionRequest" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
