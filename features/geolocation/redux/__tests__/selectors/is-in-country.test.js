import { setup } from '../utils.js'

describe('is-in-country', () => {
  it('should return false if no country code passed', () => {
    const { store, selectors } = setup()
    const selector = selectors.geolocation.isInCountry()

    expect(selector(store.getState())).toEqual(false)
  })

  it('should return false if incorrect country code passed', () => {
    const { store, selectors } = setup()
    const selector = selectors.geolocation.isInCountry('GB')

    expect(selector(store.getState())).toEqual(false)
  })

  it('should return true if current country code passed', () => {
    const { store, selectors, handleEvent } = setup()
    const selector = selectors.geolocation.isInCountry('GB')

    handleEvent('geolocation', { countryCode: 'GB' })

    expect(selector(store.getState())).toEqual(true)
  })
})
