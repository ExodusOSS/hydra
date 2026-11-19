import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'DAppConnectionDelete',
    properties: {
      ...commonProps,
      dapp_domain: 'app.hopusdc.net',
    },
  },
]

describe('DAppConnectionDelete', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "DAppConnectionDelete" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "DAppConnectionDelete" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "DAppConnectionDelete" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
