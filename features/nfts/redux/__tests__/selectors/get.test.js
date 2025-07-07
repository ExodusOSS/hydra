import { setup } from '../utils.js'

describe('get', () => {
  it('should return undefined if id not provided', () => {
    const { store, selectors } = setup()

    expect(selectors.nfts.get(store.getState())()).toEqual(undefined)
  })

  it('should return undefined if network not provided', () => {
    const { store, selectors, handleEvent } = setup()

    const nfts = { exodus_0: {} }

    handleEvent('nfts', nfts)

    expect(selectors.nfts.get(store.getState())({ id: 'some-id' })).toEqual(undefined)
  })

  it('should return null when nft not present', () => {
    const { store, selectors, handleEvent } = setup()

    const bitcoinNft = { id: 'bitcoin:someId1', owner: 'owner' }
    const bitcoinNfts = { exodus_0: { bitcoin: [bitcoinNft] } }

    handleEvent('nfts', bitcoinNfts)

    expect(selectors.nfts.get(store.getState())({ id: 'bitcoin:someId2' })).toEqual(null)
  })

  it('should return undefined when data not loaded', () => {
    const { store, selectors, handleEvent } = setup()

    const bitcoinNfts = { exodus_0: {} }

    handleEvent('nfts', bitcoinNfts)

    expect(selectors.nfts.get(store.getState())({ id: 'bitcoin:someId2' })).toEqual(undefined)
  })

  it('should return nft when present', () => {
    const { store, selectors, handleEvent } = setup()

    const bitcoinNft = { id: 'bitcoin:someId1', owner: 'owner' }
    const solanaNft = { id: 'solana:someId2', owner: 'owner' }
    const nfts = { exodus_0: { bitcoin: [bitcoinNft], solana: [solanaNft] } }

    handleEvent('nfts', nfts)

    expect(selectors.nfts.get(store.getState())({ id: 'bitcoin:someId1' })).toEqual(bitcoinNft)
    expect(selectors.nfts.get(store.getState())({ id: 'solana:someId2' })).toEqual(solanaNft)
  })

  it('should return nft when present wallet is provided', () => {
    const { store, selectors, handleEvent } = setup()

    const bitcoinNft1 = { id: 'bitcoin:someId1', owner: 'owner1' }
    const bitcoinNft2 = { id: 'bitcoin:someId1', owner: 'owner2' }
    const solanaNft = { id: 'solana:someId2', owner: 'owner' }
    const nfts = {
      exodus_0: { bitcoin: [bitcoinNft1], solana: [solanaNft] },
      exodus_1: { bitcoin: [bitcoinNft2, { id: 'bitcoin:someId2', owner: 'owner3' }] },
    }

    handleEvent('nfts', nfts)

    expect(selectors.nfts.get(store.getState())({ id: 'bitcoin:someId1' })).toEqual(bitcoinNft1)
    expect(
      selectors.nfts.get(store.getState())({ id: 'bitcoin:someId1', walletAccount: 'exodus_0' })
    ).toEqual(bitcoinNft1)
    expect(
      selectors.nfts.get(store.getState())({ id: 'bitcoin:someId1', walletAccount: 'exodus_1' })
    ).toEqual(bitcoinNft2)
    expect(
      selectors.nfts.get(store.getState())({
        id: 'bitcoin:someIdInvalid',
        walletAccount: 'exodus_1',
      })
    ).toEqual(null)
    expect(
      selectors.nfts.get(store.getState())({
        id: 'bitcoin:someId',
        walletAccount: 'exodus_9',
      })
    ).toEqual(null)
    expect(selectors.nfts.get(store.getState())({ id: 'solana:someId2' })).toEqual(solanaNft)
  })
})
