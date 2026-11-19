import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'OnRampProviderStatusChange',
    properties: {
      ...commonProps,
      country: 'CA',
      created_at: 'Thu, Jul 6, 2023 3:33 PM',
      exchange_rate: 0.99,
      from_amount: 1,
      from_amount_usd: 1,
      from_asset: 'USD',
      network_fee: 0.010_879_74,
      payment_method: 'GOOGLE_PAY',
      provider: 'ramp',
      provider_fee: 5.156_945_654_565_735,
      status: 'RELEASED',
      to_amount: 147.643_556,
      to_amount_usd: 147.633_588_408_290_93,
      to_asset: 'USDC',
      total_fee: 7.236_514_195_824_197,
      type: 'buy',
      user_id: 'zUpsP1VDjE37REB7RqFm5+QAijMzB2224nAVs12LI9h4=',
      order_id: '4d1321d5-d6b8-1823-134p-25c97ace2bc7',
    },
  },
]

describe('OnRampProviderStatusChange', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "OnRampProviderStatusChange" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "OnRampProviderStatusChange" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "OnRampProviderStatusChange" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })
})
