import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayCashPointsTierDetailsView',
    properties: {
      ...commonProps,
    },
  },
]

describe('PayCashPointsTierDetailsView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayCashPointsTierDetailsView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayCashPointsTierDetailsView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayCashPointsTierDetailsView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
