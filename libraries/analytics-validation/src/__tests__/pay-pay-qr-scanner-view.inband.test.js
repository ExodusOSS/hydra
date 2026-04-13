import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayPayQRScannerView',
    properties: {
      ...commonProps,
    },
  },
]

describe('PayPayQRScannerView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayPayQRScannerView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayPayQRScannerView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayPayQRScannerView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
