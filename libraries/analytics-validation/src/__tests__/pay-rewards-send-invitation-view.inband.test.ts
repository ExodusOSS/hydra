import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayRewardsSendInvitationView',
    properties: {
      ...commonProps,
      asset_name: 'usdcoin_solana',
      network: 'solana',
      amount_usd: 25.5,
    },
  },
  {
    event: 'PayRewardsSendInvitationView',
    properties: {
      ...commonProps,
      asset_name: 'tetherusd_tronmainnet',
      network: 'tronmainnet',
      amount_usd: null,
    },
  },
  {
    event: 'PayRewardsSendInvitationView',
    properties: {
      ...commonProps,
      asset_name: 'usdcoin_basemainnet',
      network: 'basemainnet',
    },
  },
]

describe('PayRewardsSendInvitationView', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayRewardsSendInvitationView" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayRewardsSendInvitationView" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayRewardsSendInvitationView" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject a non-string asset_name', () => {
    expect(() =>
      validate({
        event: 'PayRewardsSendInvitationView',
        properties: { ...fixtures[0]!.properties, asset_name: 1 },
      })
    ).toThrow()
  })

  it('Should reject a null network', () => {
    expect(() =>
      validate({
        event: 'PayRewardsSendInvitationView',
        properties: { ...fixtures[0]!.properties, network: null },
      })
    ).toThrow()
  })

  it('Should reject a negative amount_usd', () => {
    expect(() =>
      validate({
        event: 'PayRewardsSendInvitationView',
        properties: { ...fixtures[0]!.properties, amount_usd: -1 },
      })
    ).toThrow()
  })
})
