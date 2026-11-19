import { commonProps, validate } from './mainschema.js'

const fixture = {
  event: 'AdjustAttribution',
  properties: {
    ...commonProps,
    network: 'Meta Ads',
    campaign: 'latam-launch',
    adgroup: 'argentina',
    creative: 'video-1',
    tracker_token: 'abc123',
    tracker_name: 'Meta Ads::latam-launch::argentina::video-1',
    click_label: 'summer-promo',
    fb_install_referrer: 'fb-referrer-value',
  },
}

describe('AdjustAttribution', () => {
  it('validates a typical attribution event', () => {
    expect(validate(fixture)).toEqual(fixture)
  })

  it('validates with cost properties', () => {
    const event = {
      ...fixture,
      properties: {
        ...fixture.properties,
        cost_type: 'CPI',
        cost_amount: 1.5,
        cost_currency: 'USD',
      },
    }
    expect(validate(event)).toEqual(event)
  })

  it('allows attribution fields to be absent', () => {
    const event = { event: 'AdjustAttribution', properties: { ...commonProps } }
    expect(validate(event)).toEqual(event)
  })

  it('rejects null on string attribution fields', () => {
    expect(() =>
      validate({ ...fixture, properties: { ...fixture.properties, network: null } })
    ).toThrow()
  })

  it('rejects unexpected top-level properties', () => {
    expect(() => validate({ ...fixture, unexpected: true })).toThrow()
  })

  it('rejects unexpected properties in properties', () => {
    expect(() =>
      validate({ ...fixture, properties: { ...fixture.properties, unexpected: true } })
    ).toThrow()
  })

  it('rejects cost_amount of invalid type', () => {
    expect(() =>
      validate({ ...fixture, properties: { ...fixture.properties, cost_amount: 'not-a-number' } })
    ).toThrow()
  })
})
