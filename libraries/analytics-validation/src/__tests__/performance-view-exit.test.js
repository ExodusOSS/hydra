import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PerformanceViewExit',
    properties: {
      ...commonProps,
      duration: 1.2,
      origin: '/foo',
      destination: '/bar',
    },
  },
]

describe('PerformanceViewExit', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PerformanceViewExit" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PerformanceViewExit" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PerformanceViewExit" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "PerformanceViewExit" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, duration: 'test' },
        })
      ).toThrow()

      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, origin: 10 },
        })
      ).toThrow()

      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, destination: 10 },
        })
      ).toThrow()
    })
  })
})
