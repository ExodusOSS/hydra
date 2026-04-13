import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayCardSettingsFreezeToggle',
    properties: {
      ...commonProps,
      toggle_on: true,
    },
  },
  {
    event: 'PayCardSettingsFreezeToggle',
    properties: {
      ...commonProps,
      toggle_on: false,
    },
  },
]

describe('PayCardSettingsFreezeToggle', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayCardSettingsFreezeToggle" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayCardSettingsFreezeToggle" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayCardSettingsFreezeToggle" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject invalid toggle_on type', () => {
    expect(() =>
      validate({
        event: 'PayCardSettingsFreezeToggle',
        properties: {
          ...commonProps,
          toggle_on: 'yes',
        },
      })
    ).toThrow()
  })
})
