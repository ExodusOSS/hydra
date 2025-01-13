import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'SupportFeedbackTap',
    properties: {
      ...commonProps,
      feedback: 2,
    },
  },
]

describe('SupportFeedbackTap', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "SupportFeedbackTap" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "SupportFeedbackTap" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "SupportFeedbackTap" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "SupportFeedbackTap" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, feedback: '2' },
        })
      ).toThrow()
    })
  })
})
