import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayCashPointsExpandedView',
    properties: {
      ...commonProps,
      can_convert: true,
      points_to_convert: 1500,
    },
  },
  {
    event: 'PayCashPointsExpandedView',
    properties: {
      ...commonProps,
      can_convert: false,
      points_to_convert: 0,
    },
  },
]

describe('PayCashPointsExpandedView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayCashPointsExpandedView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayCashPointsExpandedView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayCashPointsExpandedView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid can_convert type', () => {
    expect(() =>
      validate({
        event: 'PayCashPointsExpandedView',
        properties: {
          ...commonProps,
          can_convert: 'yes',
          points_to_convert: 100,
        },
      })
    ).toThrow()
  })

  it('Should reject invalid points_to_convert type', () => {
    expect(() =>
      validate({
        event: 'PayCashPointsExpandedView',
        properties: {
          ...commonProps,
          can_convert: true,
          points_to_convert: '100',
        },
      })
    ).toThrow()
  })
})
