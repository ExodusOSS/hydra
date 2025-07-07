import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'Web3browserWebsiteLoadingFail',
    properties: {
      ...commonProps,
      domain: 'https://www.example.com',
      error: -1003,
    },
  },
]

describe('Web3browserWebsiteLoadingFail', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "Web3browserWebsiteLoadingFail" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "Web3browserWebsiteLoadingFail" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "Web3browserWebsiteLoadingFail" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "Web3browserWebsiteLoadingFail" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, error: true },
        })
      ).toThrow()

      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, error: 'NaN' },
        })
      ).toThrow()

      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, domain: 'not-uri' },
        })
      ).toThrow()

      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, domain: true },
        })
      ).toThrow()
    })
  })
})
