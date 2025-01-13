import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'Web3BrowserConnectionDeleted',
    properties: {
      ...commonProps,
      dapp_domain: 'app.hopusdc.net',
    },
  },
]

describe('Web3BrowserConnectionDeleted', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "Web3BrowserConnectionDeleted" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "Web3BrowserConnectionDeleted" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "Web3BrowserConnectionDeleted" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
