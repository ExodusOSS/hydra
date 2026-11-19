import { commonProps, validate } from './mainschema.js'

const event = {
  event: 'PayRewardsDisable',
  properties: {
    ...commonProps,
    cash_balance_usd: 1250.5,
  },
}

describe('PayRewardsDisable', () => {
  it('The main schema validates "PayRewardsDisable" event', () => {
    expect(validate(event)).toEqual(event)
  })

  it('The main schema rejects unexpected properties of "PayRewardsDisable" event', () => {
    expect(() => validate({ ...event, test: true })).toThrow()
  })

  it('The main schema rejects unexpected properties in "properties" of "PayRewardsDisable" event', () => {
    expect(() =>
      validate({ event: event.event, properties: { ...event.properties, test: true } })
    ).toThrow()
  })

  it('Should reject funnel properties that belong to other rewards events', () => {
    expect(() =>
      validate({
        event: 'PayRewardsDisable',
        properties: { ...event.properties, entry_point: 'settings' },
      })
    ).toThrow()
  })
})
