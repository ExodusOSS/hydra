import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayHomeCardTap',
    properties: {
      ...commonProps,
      home_card_name: 'unlock-reward',
    },
  },
  {
    event: 'PayHomeCardTap',
    properties: {
      ...commonProps,
      home_card_name: 'verify',
    },
  },
]

describe('PayHomeCardTap', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayHomeCardTap" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayHomeCardTap" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayHomeCardTap" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid home_card_name value', () => {
    expect(() =>
      validate({
        event: 'PayHomeCardTap',
        properties: {
          ...commonProps,
          home_card_name: 'invalid-card',
        },
      })
    ).toThrow()
  })

  it('Should reject invalid home_card_name type', () => {
    expect(() =>
      validate({
        event: 'PayHomeCardTap',
        properties: {
          ...commonProps,
          home_card_name: 123,
        },
      })
    ).toThrow()
  })
})
