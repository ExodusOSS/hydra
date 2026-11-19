import { commonProps, validate } from './mainschema.js'

const ORIGINS = [
  'default-region',
  'invite-code',
  'xo-cash',
  'wallet-banner',
  'classic-wallet-menu',
  'spend-card-promo',
]

const fixtures = [
  {
    event: 'PayOpen',
    properties: {
      ...commonProps,
    },
  },
  {
    event: 'PayOpen',
    properties: {
      ...commonProps,
      origin: 'classic-wallet-menu',
    },
  },
]

describe('PayOpen', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayOpen" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayOpen" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayOpen" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  ORIGINS.forEach((origin) => {
    it(`Should accept origin "${origin}"`, () => {
      const event = {
        event: 'PayOpen',
        properties: {
          ...commonProps,
          origin,
        },
      }
      expect(validate(event)).toEqual(event)
    })
  })

  it('Should reject non-string origin', () => {
    expect(() =>
      validate({
        event: 'PayOpen',
        properties: {
          ...commonProps,
          origin: 42,
        },
      })
    ).toThrow()
  })
})
