import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'DeepLinkLaunch',
    properties: {
      ...commonProps,
      scheme: 'exodus',
    },
  },
  {
    event: 'DeepLinkLaunch',
    properties: {
      ...commonProps,
      scheme: 'bitcoin',
    },
  },
]

describe('DeepLinkLaunch', () => {
  fixtures.forEach((event) => {
    test('validates "DeepLinkLaunch" event', () => {
      expect(validate(event)).toEqual(event)
    })

    test('rejects unexpected properties of "DeepLinkLaunch" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    test('rejects unexpected properties in "properties" of "DeepLinkLaunch" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    test('rejects scheme property of invalid type', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, scheme: 3 },
        })
      ).toThrow()
    })

    test('rejects scheme property of invalid length', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: {
            ...event.properties,
            scheme: 'bitcoin:bc1qyphu9r5a2ac90jq34vjuttn6pl9r8xxsg90mkv?amount=0.00093582',
          },
        })
      ).toThrow()
    })
  })
})
