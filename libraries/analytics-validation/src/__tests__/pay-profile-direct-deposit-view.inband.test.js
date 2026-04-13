import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayProfileDirectDepositView',
    properties: {
      ...commonProps,
    },
  },
]

describe('PayProfileDirectDepositView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayProfileDirectDepositView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayProfileDirectDepositView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayProfileDirectDepositView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
