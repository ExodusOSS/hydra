import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayOnboardingSlidesView',
    properties: {
      ...commonProps,
    },
  },
]

describe('PayOnboardingSlidesView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayOnboardingSlidesView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayOnboardingSlidesView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayOnboardingSlidesView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
