import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'ModalDelistingAssetsView',
    properties: {
      ...commonProps,
      asset_names: ['nano', 'terra'],
      amounts: [1, 2],
      amounts_usd: [4, 5],
    },
  },
]

describe('ModalDelistingAssetsView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "ModalDelistingAssetsView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "ModalDelistingAssetsView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "ModalDelistingAssetsView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "ModalDelistingAssetsView" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, asset_names: 'nano' },
        })
      ).toThrow()
    })
  })
})
