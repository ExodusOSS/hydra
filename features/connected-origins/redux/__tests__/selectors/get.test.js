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

describe('get', () => {
  it('should return undefined if connections not loaded', () => {
    const { store, selectors } = setup()

    expect(selectors.connectedOrigins.get(store.getState())('https://exodus.com')).toEqual(
      undefined
    )
  })

  it('should return undefined if connections loaded but not preset', () => {
    const { store, selectors, handleEvent } = setup()

    handleEvent('connectedOrigins', [EXODUS_CONNECTION])

    expect(selectors.connectedOrigins.get(store.getState())('https://magiceden.io')).toEqual(
      undefined
    )
  })

  it('should return connection when preset', () => {
    const { store, selectors, handleEvent } = setup()

    handleEvent('connectedOrigins', [EXODUS_CONNECTION])

    expect(selectors.connectedOrigins.get(store.getState())('https://exodus.com')).toEqual(
      EXODUS_CONNECTION
    )
  })
})
