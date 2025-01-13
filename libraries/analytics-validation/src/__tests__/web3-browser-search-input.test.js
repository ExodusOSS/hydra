import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'Web3BrowserSearchInput',
    properties: {
      ...commonProps,
      input: 'magiceden',
      is_url: false,
      matches_found: true,
      is_final: false,
    },
  },
]

describe('Web3BrowserSearchInput', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "Web3BrowserSearchInput" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "Web3BrowserSearchInput" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "Web3BrowserSearchInput" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
