import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayProfileSupportMessageSend',
    properties: {
      ...commonProps,
      has_safe_report: true,
    },
  },
  {
    event: 'PayProfileSupportMessageSend',
    properties: {
      ...commonProps,
      has_safe_report: false,
    },
  },
]

describe('PayProfileSupportMessageSend', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayProfileSupportMessageSend" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayProfileSupportMessageSend" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayProfileSupportMessageSend" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid has_safe_report type', () => {
    expect(() =>
      validate({
        event: 'PayProfileSupportMessageSend',
        properties: {
          ...commonProps,
          has_safe_report: 'yes',
        },
      })
    ).toThrow()
  })
})
