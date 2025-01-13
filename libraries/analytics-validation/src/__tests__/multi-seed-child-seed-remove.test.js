import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'MultiSeedChildSeedRemove',
    properties: {
      ...commonProps,
    },
  },
]

describe('MultiSeedChildSeedRemove', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "MultiSeedChildSeedRemove" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "MultiSeedChildSeedRemove" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "MultiSeedChildSeedRemove" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "MultiSeedChildSeedRemove" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, child_telemetry_identifier: false },
        })
      ).toThrow()
    })
  })
})
