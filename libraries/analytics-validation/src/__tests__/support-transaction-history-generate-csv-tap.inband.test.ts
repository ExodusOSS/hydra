import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'SupportTransactionHistoryGenerateCsvTap',
    properties: {
      ...commonProps,
      success: true,
    },
  },
]

describe('SupportTransactionHistoryGenerateCsvTap', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "SupportTransactionHistoryGenerateCsvTap" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "SupportTransactionHistoryGenerateCsvTap" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "SupportTransactionHistoryGenerateCsvTap" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "SupportTransactionHistoryGenerateCsvTap" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, success: 'yes' },
        })
      ).toThrow()
    })
  })
})
