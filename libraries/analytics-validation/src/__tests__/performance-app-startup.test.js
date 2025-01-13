import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PerformanceAppStartup',
    properties: {
      ...commonProps,
      start_time: 123,
      destination: 'Screen',
    },
  },
]

describe('PerformanceAppStartup', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PerformanceAppStartup" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PerformanceAppStartup" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PerformanceAppStartup" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "PerformanceAppStartup" property of invalid format', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, page_order: 'cat' } })
      ).toThrow()
    })
  })
})
