import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'DAppAutoApproveUnset',
    properties: {
      ...commonProps,
      dapp_domain: 'app.hopusdc.net',
    },
  },
]

describe('DAppAutoApproveUnset', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "DAppAutoApproveUnset" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "DAppAutoApproveUnset" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "DAppAutoApproveUnset" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
