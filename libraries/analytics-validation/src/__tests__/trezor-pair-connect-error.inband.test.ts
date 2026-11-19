import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'TrezorPairConnectError',
    properties: {
      ...commonProps,
      origin: 'onboarding',
      error_type: 'connection_failed',
    },
  },
]

describe('TrezorPairConnectError', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "TrezorPairConnectError" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "TrezorPairConnectError" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "TrezorPairConnectError" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "TrezorPairConnectError" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, error_type: false },
        })
      ).toThrow()
    })
  })
})
