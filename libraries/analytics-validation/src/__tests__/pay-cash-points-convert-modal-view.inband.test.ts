import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayCashPointsConvertModalView',
    properties: {
      ...commonProps,
    },
  },
]

describe('PayCashPointsConvertModalView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayCashPointsConvertModalView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayCashPointsConvertModalView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayCashPointsConvertModalView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
