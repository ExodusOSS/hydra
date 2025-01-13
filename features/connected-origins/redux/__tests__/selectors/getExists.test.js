import { setup } from '../utils.js'

const EXODUS_CONNECTION = {
  activeConnections: [],
  assetNames: ['solana'],
  autoApprove: false,
  connectedAssetName: 'solana',
  createdAt: 0,
  favorite: false,
  icon: null,
  name: 'Exodus',
  origin: 'https://exodus.com',
  trusted: true,
  label: 'Exodus',
}

describe('getExists', () => {
  it('should return false if connections not loaded', () => {
    const { store, selectors } = setup()

    expect(selectors.connectedOrigins.getExists(store.getState())('solana')).toEqual(false)
  })

  it('should return true if connections loaded and asset not passed', () => {
    const { store, selectors, handleEvent } = setup()

    handleEvent('connectedOrigins', [EXODUS_CONNECTION])

    expect(selectors.connectedOrigins.getExists(store.getState())()).toEqual(true)
  })

  it('should return false if no connections for passed asset', () => {
    const { store, selectors, handleEvent } = setup()

    handleEvent('connectedOrigins', [EXODUS_CONNECTION])

    expect(selectors.connectedOrigins.getExists(store.getState())('algorand')).toEqual(false)
  })

  it('should return true if connections present for passed asset', () => {
    const { store, selectors, handleEvent } = setup()

    handleEvent('connectedOrigins', [EXODUS_CONNECTION])

    expect(selectors.connectedOrigins.getExists(store.getState())('solana')).toEqual(true)
  })
})
