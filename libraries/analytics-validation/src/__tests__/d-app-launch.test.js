import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'DAppLaunch',
    properties: {
      ...commonProps,
      dapp_domain: 'portfolio.metamask.io',
    },
  },
]

describe('DAppLaunch', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "DAppLaunch" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "DAppLaunch" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "DAppLaunch" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
