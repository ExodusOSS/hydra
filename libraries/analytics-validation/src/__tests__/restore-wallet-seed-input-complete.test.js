import { commonProps, validate } from './mainschema.js'

const fixtures = [
  {
    event: 'RestoreWalletSeedInputComplete',
    properties: {
      ...commonProps,
      restore_time: 123,
      backup_type: 'passkeys',
      restored_asset_count: 9,
      restored_asset_1_name: 'bitcoin',
      restored_asset_1_time: 8,
      restored_asset_2_name: 'solana',
      restored_asset_2_time: 5,
      restored_asset_3_name: 'cardano',
      restored_asset_3_time: 4,
    },
  },
]

describe('RestoreWalletSeedInputComplete', () => {
  fixtures.forEach((event) => {
    it('The main schema validates "RestoreWalletSeedInputComplete" event', () => {
      expect(validate(event)).toEqual(event)
    })

    it('The main schema rejects unexpected properties of "RestoreWalletSeedInputComplete" event', () => {
      expect(() => validate({ ...event, test: true })).toThrow()
    })

    it('The main schema rejects unexpected properties in "properties" of "RestoreWalletSeedInputComplete" event', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, test: true } })
      ).toThrow()
    })

    it('Should reject "RestoreWalletSeedInputComplete" property of invalid format', () => {
      expect(() =>
        validate({ event: event.event, properties: { ...event.properties, page_order: 'cat' } })
      ).toThrow()
    })
  })
})
