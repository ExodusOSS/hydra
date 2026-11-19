import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'ExchangeTemporaryUnavailableView',
    properties: {
      ...commonProps,
    },
  },
]

describe('ExchangeTemporaryUnavailableView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "ExchangeTemporaryUnavailableView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "ExchangeTemporaryUnavailableView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "ExchangeTemporaryUnavailableView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "ExchangeTemporaryUnavailableView" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, myProperty: 3 },
        })
      ).toThrow()
    })
  })
})
