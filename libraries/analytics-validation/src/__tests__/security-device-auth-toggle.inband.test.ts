import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'SecurityDeviceAuthToggle',
    properties: {
      ...commonProps,
      toggled_on: true,
    },
  },
  {
    event: 'SecurityDeviceAuthToggle',
    properties: {
      ...commonProps,
      toggled_on: false,
    },
  },
]

describe('SecurityDeviceAuthToggle', () => {
  fixtures.forEach((event) => {
    it(`The main schema validates "SecurityDeviceAuthToggle" event with toggled_on: ${event.properties.toggled_on}`, () => {
      expect(validate(event)).toEqual(event)
    })

    it(`The main schema rejects unexpected properties of "SecurityDeviceAuthToggle" event with toggled_on: ${event.properties.toggled_on}`, () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it(`The main schema rejects unexpected properties in "properties" of "SecurityDeviceAuthToggle" event with toggled_on: ${event.properties.toggled_on}`, () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it(`Should reject "SecurityDeviceAuthToggle" property of invalid format with toggled_on: ${event.properties.toggled_on}`, () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, toggled_on: 'cat' } })
      ).toThrow()
    })
  })
})
