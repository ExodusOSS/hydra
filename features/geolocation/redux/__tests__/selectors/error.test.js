import { setup } from '../utils'

describe('error', () => {
  it('should return null by default', () => {
    const { store, selectors } = setup()

    expect(selectors.geolocation.error(store.getState())).toEqual(null)
  })

  it('should return null when data loaded successfully', () => {
    const { store, selectors, handleEvent } = setup()

    handleEvent('geolocation', { countryCode: 'UY', countryName: 'Uruguay' })

    expect(selectors.geolocation.error(store.getState())).toEqual(null)
  })

  it('should return error when data loaded unsuccessfully', () => {
    const { store, selectors, handleEvent } = setup()

    handleEvent('geolocation', { error: 'Something went wrong' })

    expect(selectors.geolocation.error(store.getState())).toEqual('Something went wrong')
  })
})
