import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'ExchangeConfigureAssetSearchUnavailable',
    properties: {
      ...commonProps,
      to_or_from: 'to',
      content: 'foobar',
    },
  },
]

describe('ExchangeConfigureAssetSearchUnavailable', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "ExchangeConfigureAssetSearchUnavailable" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "ExchangeConfigureAssetSearchUnavailable" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "ExchangeConfigureAssetSearchUnavailable" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "ExchangeConfigureAssetSearchUnavailable" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, content: 'fo' },
        })
      ).toThrow()

      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, content: 'foobarzaz' },
        })
      ).toThrow()
    })
  })
})
