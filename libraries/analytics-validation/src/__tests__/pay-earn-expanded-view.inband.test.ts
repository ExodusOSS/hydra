import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayEarnExpandedView',
    properties: {
      ...commonProps,
      earn_unlocking_stage: 'deposit-500',
    },
  },
  {
    event: 'PayEarnExpandedView',
    properties: {
      ...commonProps,
      earn_unlocking_stage: 'spend-3000-three-months',
    },
  },
]

describe('PayEarnExpandedView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayEarnExpandedView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayEarnExpandedView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayEarnExpandedView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid earn_unlocking_stage value', () => {
    expect(() =>
      validate({
        event: 'PayEarnExpandedView',
        properties: {
          ...commonProps,
          earn_unlocking_stage: 'invalid-stage',
        },
      })
    ).toThrow()
  })

  it('Should reject invalid earn_unlocking_stage type', () => {
    expect(() =>
      validate({
        event: 'PayEarnExpandedView',
        properties: {
          ...commonProps,
          earn_unlocking_stage: 123,
        },
      })
    ).toThrow()
  })
})
