import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: '$experiment_started',
    properties: {
      ...commonProps,
      'Experiment name': 'button-color-test',
      'Variant name': 'variant_a',
      $experiment_type: 'feature_flag',
    },
  },
]

describe('$experiment_started', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "$experiment_started" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "$experiment_started" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "$experiment_started" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "$experiment_started" when missing required "Experiment name"', () => {
      const { 'Experiment name': _, ...propsWithoutExperimentName } = event.properties
      expect(() =>
        validate({
          event: event.event,
          properties: propsWithoutExperimentName,
        })
      ).toThrow()
    })

    it('Should reject "$experiment_started" when missing required "Variant name"', () => {
      const { 'Variant name': _, ...propsWithoutVariantName } = event.properties
      expect(() =>
        validate({
          event: event.event,
          properties: propsWithoutVariantName,
        })
      ).toThrow()
    })

    it('Should reject "$experiment_started" property of invalid format', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, 'Experiment name': 123 },
        })
      ).toThrow()
    })
  })
})
