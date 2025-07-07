import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'HomeSendToRobinhood',
    properties: {
      ...commonProps,
      success: true,
    },
  },
]

describe('HomeSendToRobinhood', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "HomeSendToRobinhood" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "HomeSendToRobinhood" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "HomeSendToRobinhood" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "HomeSendToRobinhood" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, success: 'success' },
        })
      ).toThrow()
    })
  })
})
