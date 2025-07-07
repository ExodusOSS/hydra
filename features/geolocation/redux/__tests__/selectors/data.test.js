import { setup } from '../utils.js'

describe('data', () => {
  it('should return default data', () => {
    const { store, selectors } = setup()

    expect(selectors.geolocation.data(store.getState())).toEqual({
      countryCode: null,
      countryName: null,
      ip: null,
      isAllowed: false,
      isProxy: false,
      regionCode: null,
      regionName: null,
      timezoneName: null,
    })
  })

  it('should return stored data', () => {
    const { store, selectors, handleEvent } = setup()

    const data = {
      countryCode: 'UY',
      countryName: 'Uruguay',
      ip: '1.2.3.4',
      isAllowed: true,
      isProxy: false,
      regionCode: 'UY',
      regionName: 'UY',
      timezoneName: 'UY',
    }

    handleEvent('geolocation', data)

    expect(selectors.geolocation.data(store.getState())).toEqual(data)
  })
})
