import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'DAppFavoriteSet',
    properties: {
      ...commonProps,
      dapp_domain: 'stake.lido.fi',
    },
  },
]

describe('DAppFavoriteSet', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "DAppFavoriteSet" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "DAppFavoriteSet" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "DAppFavoriteSet" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
