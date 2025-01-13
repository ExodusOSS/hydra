import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'DAppNetworkSwitchRequest',
    properties: {
      ...commonProps,
      approved: true,
      dapp_domain: 'app.uniswap.org',
    },
  },
]

describe('DAppNetworkSwitchRequest', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "DAppNetworkSwitchRequest" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "DAppNetworkSwitchRequest" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "DAppNetworkSwitchRequest" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
