import { setup } from '../utils.js'

describe('favorites', () => {
  it('should return default data', () => {
    const { store, selectors } = setup()

    expect(selectors.connectedOrigins.favorites(store.getState())).toEqual([])
  })

  it('should return favorite origins', () => {
    const { store, selectors, handleEvent } = setup()

    const exodusOrigin = {
      activeConnections: [],
      assetNames: ['solana'],
      autoApprove: false,
      connectedAssetName: 'solana',
      createdAt: 0,
      favorite: true,
      icon: null,
      name: 'Exodus',
      origin: 'https://exodus.com',
      trusted: true,
      label: 'Exodus',
    }

    const magicEdenOrigin = {
      activeConnections: [],
      assetNames: ['solana'],
      autoApprove: false,
      connectedAssetName: 'solana',
      createdAt: 0,
      favorite: false,
      icon: null,
      name: 'MagicEden',
      origin: 'https://magiceden.io',
      trusted: true,
      label: 'MagicEden',
    }

    handleEvent('connectedOrigins', [magicEdenOrigin, exodusOrigin])

    expect(selectors.connectedOrigins.favorites(store.getState())).toEqual([exodusOrigin])
  })
})
