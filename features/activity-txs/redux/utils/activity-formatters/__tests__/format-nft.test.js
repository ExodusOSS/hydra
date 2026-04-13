import { formatNftTx, formatUnindexedNftTx } from '../format-nft.js'

const mockAsset = { name: 'ethereum', baseAsset: { minConfirmations: 12 } }
const mockTx = (overrides) => ({ txId: 'tx1', date: new Date(), confirmations: 12, ...overrides })

describe('format-nft', () => {
  describe('determineNftSent priority', () => {
    it('should prioritize tx.received over other indicators', () => {
      const result = formatNftTx({
        assetName: 'ethereum',
        asset: mockAsset,
        tx: mockTx({ received: false, coinAmount: { isPositive: true } }),
        nft: { txId: 'tx1', sent: false },
      })

      expect(result.sent).toBe(true)
    })

    it('should use tx.coinAmount when tx.received is unavailable', () => {
      const result = formatNftTx({
        assetName: 'ethereum',
        asset: mockAsset,
        tx: mockTx({ coinAmount: { isPositive: false } }),
        nft: { txId: 'tx1', sent: false },
      })

      expect(result.sent).toBe(true)
    })

    it('should fallback to nft.sent when blockchain data unavailable', () => {
      const result = formatNftTx({
        assetName: 'ethereum',
        asset: mockAsset,
        tx: mockTx(),
        nft: { txId: 'tx1', sent: true },
      })

      expect(result.sent).toBe(true)
    })

    it('should default to false when no indicators', () => {
      const result = formatNftTx({
        assetName: 'ethereum',
        asset: mockAsset,
        tx: mockTx(),
        nft: { txId: 'tx1' },
      })

      expect(result.sent).toBe(false)
      expect(result.received).toBe(true)
    })
  })

  describe('formatUnindexedNftTx', () => {
    it('should use nftTx.sent or default to false', () => {
      const withSent = formatUnindexedNftTx({
        assetName: 'ethereum',
        nftTx: { txId: 'tx1', date: new Date(), sent: true },
      })
      expect(withSent.sent).toBe(true)

      const withoutSent = formatUnindexedNftTx({
        assetName: 'ethereum',
        nftTx: { txId: 'tx2', date: new Date() },
      })
      expect(withoutSent.sent).toBe(false)
    })
  })
})
