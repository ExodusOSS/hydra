import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'TrezorAccountDisconnect',
    properties: {
      ...commonProps,
      origin: 'settings',
      amount_usd: '3516',
    },
  },
]

describe('TrezorAccountDisconnect', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "TrezorAccountDisconnect" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "TrezorAccountDisconnect" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "TrezorAccountDisconnect" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "TrezorAccountDisconnect" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, amount_usd: false },
        })
      ).toThrow()
    })
  })
})
