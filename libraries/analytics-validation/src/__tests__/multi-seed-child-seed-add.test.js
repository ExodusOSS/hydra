import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'MultiSeedChildSeedAdd',
    properties: {
      ...commonProps,
    },
  },
]

describe('MultiSeedChildSeedAdd', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "MultiSeedChildSeedAdd" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "MultiSeedChildSeedAdd" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "MultiSeedChildSeedAdd" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "MultiSeedChildSeedAdd" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, child_telemetry_identifier: false },
        })
      ).toThrow()
    })
  })
})
