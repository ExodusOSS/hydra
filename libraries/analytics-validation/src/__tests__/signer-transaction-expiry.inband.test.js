import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'SignerTransactionExpiry',
    properties: {
      ...commonProps,
      baseAssetName: 'solana',
    },
  },
]

describe('SignerTransactionExpiry', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "SignerTransactionExpiry" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "SignerTransactionExpiry" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "SignerTransactionExpiry" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "SignerTransactionExpiry" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, baseAssetName: true },
        })
      ).toThrow()
    })
  })
})
