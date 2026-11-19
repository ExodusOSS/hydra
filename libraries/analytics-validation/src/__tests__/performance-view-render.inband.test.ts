import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PerformanceViewRender',
    properties: {
      ...commonProps,
      render_time: 123,
      render_state: 'ready',
      abort_time: 123,
      origin: 'Screen1',
      destination: 'Screen2',
    },
  },
]

describe('PerformanceViewRender', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PerformanceViewRender" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PerformanceViewRender" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PerformanceViewRender" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "PerformanceViewRender" property of invalid format', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, page_order: 'cat' } })
      ).toThrow()
    })
  })
})
