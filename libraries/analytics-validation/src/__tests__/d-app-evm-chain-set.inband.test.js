import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'DappEvmChainSet',
    properties: {
      ...commonProps,
      chain_id: '0x38',
      dapp_domain: 'app.duet.finance',
    },
  },
]

describe('DappEvmChainSet', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "DappEvmChainSet" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "DappEvmChainSet" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "DappEvmChainSet" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
