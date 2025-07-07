import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'WalletView',
    properties: {
      ...commonProps,
      style_mode: 'cards',
      sort_by_option: 'portfolio_value',
    },
  },
]

describe('WalletView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "WalletView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "WalletView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "WalletView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject invalid "style_mode" value', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, style_mode: 'invalid_value' },
        })
      ).toThrow()
    })

    it('Should reject invalid "sort_by_option" value', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, sort_by_option: 'invalid_value' },
        })
      ).toThrow()
    })

    it('Should reject "style_mode" of invalid type', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, style_mode: 123 },
        })
      ).toThrow()
    })

    it('Should reject "sort_by_option" of invalid type', () => {
      expect(() =>
        validate({
          event: event.event,
          properties: { ...event.properties, sort_by_option: false },
        })
      ).toThrow()
    })

    it('Should validate all valid "style_mode" enum values', () => {
      const validStyleModes = ['cards', 'donut']
      validStyleModes.forEach((mode) => {
        const validEvent = {
          event: 'WalletView',
          properties: {
            ...commonProps,
            style_mode: mode,
            sort_by_option: 'portfolio_value',
          },
        }
        expect(validate(validEvent)).toEqual(validEvent)
      })
    })

    it('Should validate all valid "sort_by_option" enum values', () => {
      const validSortOptions = [
        'portfolio_value',
        'market_cap',
        '24h_change',
        '24h_volume',
        'name',
        'with_balance',
      ]
      validSortOptions.forEach((option) => {
        const validEvent = {
          event: 'WalletView',
          properties: {
            ...commonProps,
            style_mode: 'cards',
            sort_by_option: option,
          },
        }
        expect(validate(validEvent)).toEqual(validEvent)
      })
    })
  })
})
