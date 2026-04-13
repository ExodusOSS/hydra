import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayHomeView',
    properties: {
      ...commonProps,
    },
  },
]

describe('PayHomeView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayHomeView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayHomeView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayHomeView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
