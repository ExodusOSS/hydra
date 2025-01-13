import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'ModalFirstFundView',
    properties: {
      ...commonProps,
      asset_name: 'bitcoin',
      network: 'bitcoin',
      amount: 0.001,
      amount_usd: 18,
    },
  },
]

describe('ModalFirstFundView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "ModalFirstFundView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "ModalFirstFundView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "ModalFirstFundView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "ModalFirstFundView" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, amount_usd: '3' },
        })
      ).toThrow()
    })
  })
})
