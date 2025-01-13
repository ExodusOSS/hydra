import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'DAppAutoApproveSet',
    properties: {
      ...commonProps,
      dapp_domain: 'app.hopusdc.net',
    },
  },
]

describe('DAppAutoApproveSet', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "DAppAutoApproveSet" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "DAppAutoApproveSet" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "DAppAutoApproveSet" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
