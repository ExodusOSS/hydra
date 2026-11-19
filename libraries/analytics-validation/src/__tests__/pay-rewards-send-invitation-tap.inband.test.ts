import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'PayRewardsSendInvitationTap',
    properties: {
      ...commonProps,
      asset_name: 'usdcoin_solana',
      network: 'solana',
      amount_usd: 25.5,
    },
  },
  {
    event: 'PayRewardsSendInvitationTap',
    properties: {
      ...commonProps,
      asset_name: 'tetherusd_tronmainnet',
      network: 'tronmainnet',
      amount_usd: null,
    },
  },
  {
    event: 'PayRewardsSendInvitationTap',
    properties: {
      ...commonProps,
      asset_name: 'usdcoin_basemainnet',
      network: 'basemainnet',
    },
  },
]

describe('PayRewardsSendInvitationTap', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "PayRewardsSendInvitationTap" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "PayRewardsSendInvitationTap" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "PayRewardsSendInvitationTap" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })
  })

  it('Should reject a non-string asset_name', () => {
    expect(() =>
      validate({
        event: 'PayRewardsSendInvitationTap',
        properties: { ...fixtures[0]!.properties, asset_name: 1 },
      })
    ).toThrow()
  })

  it('Should reject a null network', () => {
    expect(() =>
      validate({
        event: 'PayRewardsSendInvitationTap',
        properties: { ...fixtures[0]!.properties, network: null },
      })
    ).toThrow()
  })

  it('Should reject a negative amount_usd', () => {
    expect(() =>
      validate({
        event: 'PayRewardsSendInvitationTap',
        properties: { ...fixtures[0]!.properties, amount_usd: -1 },
      })
    ).toThrow()
  })
})
