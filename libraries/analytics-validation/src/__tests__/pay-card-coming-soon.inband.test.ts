import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayCardComingSoonView',
    properties: {
      ...commonProps,
    },
  },
  {
    event: 'PayCardComingSoonNotify',
    properties: {
      ...commonProps,
      country: 'US',
    },
  },
]

describe('PayCardComingSoon events', () => {
  fixtures.forEach((event) => {
    it(`The main schema validates "${event.event}" event`, () => {
      expect(validate(event)).toEqual(event)
    })

    it(`The main schema rejects unexpected top-level properties of "${event.event}" event`, () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it(`The main schema rejects unexpected nested properties of "${event.event}" event`, () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid "country" type on "PayCardComingSoonNotify"', () => {
    expect(() =>
      validate({
        event: 'PayCardComingSoonNotify',
        properties: { ...commonProps, country: 123 },
      })
    ).toThrow()
  })
})
