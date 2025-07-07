import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'WalletAssetSend',
    properties: {
      ...commonProps,
      success: true,
      amount: '1.3',
      amount_usd: '140',
      asset_name: 'bitcoin',
      network: 'bitcoin',
      spendable_balance: 1,
      asset_balance: 2,
      asset_balance_usd: 3,
    },
  },
]

describe('WalletAssetSend', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "WalletAssetSend" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "WalletAssetSend" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "WalletAssetSend" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it.each([
      { propertiesOverride: { success: 'test' } },
      { propertiesOverride: { amount: 100 } },
      { propertiesOverride: { amount_usd: 2 } },
      { propertiesOverride: { network_fee_amount: '2' } },
      { propertiesOverride: { network_fee_amount_usd: '2' } },
      { propertiesOverride: { slide_position: 1 } },
      { propertiesOverride: { change_fee_enabled: 'true' } },
      { propertiesOverride: { failure_reason: 1 } },
      { propertiesOverride: { failure_hint: 1 } },
      { propertiesOverride: { is_repeated_address: 'maybe' } },
    ])(
      'should reject "WalletAssetSent" with invalid format ($propertiesOverride)',
      async ({ propertiesOverride }) => {
        expect(() =>
          validate({
            event: event.event,
            properties: { ...event.properties, ...propertiesOverride },
          })
        ).toThrow()
      }
    )

    it.each([
      { propertiesOverride: { failure_hint: 'some hint' } },
      { propertiesOverride: { failure_reason: 'some error' } },
      { propertiesOverride: { is_repeated_address: true } },
    ])(
      'should accept "WalletAssetSent" with valid format ($propertiesOverride)',
      async ({ propertiesOverride }) => {
        expect(() =>
          validate({
            event: event.event,
            properties: { ...event.properties, ...propertiesOverride },
          })
        ).not.toThrow()
      }
    )
  })
})
