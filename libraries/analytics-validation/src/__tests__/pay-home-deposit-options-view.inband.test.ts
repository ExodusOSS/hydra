import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayHomeDepositOptionsView',
    properties: {
      ...commonProps,
    },
  },
]

describe('PayHomeDepositOptionsView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayHomeDepositOptionsView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayHomeDepositOptionsView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayHomeDepositOptionsView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
