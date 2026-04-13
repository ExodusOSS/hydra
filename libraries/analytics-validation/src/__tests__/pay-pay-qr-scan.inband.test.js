import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayPayQRScan',
    properties: {
      ...commonProps,
    },
  },
]

describe('PayPayQRScan', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayPayQRScan" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayPayQRScan" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayPayQRScan" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
