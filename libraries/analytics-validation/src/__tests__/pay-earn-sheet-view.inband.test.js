import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayEarnSheetView',
    properties: {
      ...commonProps,
      earn_unlocking_stage: 'deposit-500',
    },
  },
  {
    event: 'PayEarnSheetView',
    properties: {
      ...commonProps,
      earn_unlocking_stage: 'hold-500-one-month',
    },
  },
]

describe('PayEarnSheetView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayEarnSheetView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayEarnSheetView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayEarnSheetView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid earn_unlocking_stage value', () => {
    expect(() =>
      validate({
        event: 'PayEarnSheetView',
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
        event: 'PayEarnSheetView',
        properties: {
          ...commonProps,
          earn_unlocking_stage: 123,
        },
      })
    ).toThrow()
  })
})
