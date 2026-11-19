import { WalletAccount } from '@exodus/models'

import NftsTransactionsNetworkMonitor from '../NftsTransactionsNetworkMonitor.js'

const { DEFAULT: DEFAULT_WALLET_ACCOUNT } = WalletAccount

describe('NftsTransactionsNetworkMonitor', () => {
  const setup = () => ({
    addressProvider: { getReceiveAddress: jest.fn() },
    nftsProxy: { ethereum: { getNftsTransactionsByAddress: jest.fn() } },
    logger: { warn: jest.fn(), error: jest.fn() },
    asset: { name: 'ethereum', api: { features: { nfts: true } } },
  })

  describe('#determineSent', () => {
    it('should mark as sent when from matches owner', async () => {
      const { addressProvider, nftsProxy, logger, asset } = setup()
      const ownerAddress = '0xOwner123'

      addressProvider.getReceiveAddress.mockResolvedValue(ownerAddress)
      nftsProxy.ethereum.getNftsTransactionsByAddress.mockResolvedValue([
        { txId: 'tx1', from: ownerAddress.toLowerCase(), to: '0xRecipient' },
      ])

      const monitor = new NftsTransactionsNetworkMonitor({
        addressProvider,
        asset,
        network: 'ethereum',
        nftsProxy,
        logger,
      })

      let result
      monitor.on('txs', (data) => (result = data))
      await monitor.fetch({ walletAccount: DEFAULT_WALLET_ACCOUNT })

      expect(result.txs[0].sent).toBe(true)
    })

    it('should mark as received when from does not match owner', async () => {
      const { addressProvider, nftsProxy, logger, asset } = setup()
      const ownerAddress = '0xOwner123'

      addressProvider.getReceiveAddress.mockResolvedValue(ownerAddress)
      nftsProxy.ethereum.getNftsTransactionsByAddress.mockResolvedValue([
        { txId: 'tx1', from: '0xOther456', to: ownerAddress },
      ])

      const monitor = new NftsTransactionsNetworkMonitor({
        addressProvider,
        asset,
        network: 'ethereum',
        nftsProxy,
        logger,
      })

      let result
      monitor.on('txs', (data) => (result = data))
      await monitor.fetch({ walletAccount: DEFAULT_WALLET_ACCOUNT })

      expect(result.txs[0].sent).toBe(false)
    })

    it('should handle null/undefined gracefully', async () => {
      const { addressProvider, nftsProxy, logger, asset } = setup()

      addressProvider.getReceiveAddress.mockResolvedValue('0xOwner123')
      nftsProxy.ethereum.getNftsTransactionsByAddress.mockResolvedValue([
        { txId: 'tx1', from: null, to: '0xRecipient' },
        { txId: 'tx2', to: '0xRecipient' }, // from: undefined
      ])

      const monitor = new NftsTransactionsNetworkMonitor({
        addressProvider,
        asset,
        network: 'ethereum',
        nftsProxy,
        logger,
      })

      let result
      monitor.on('txs', (data) => (result = data))
      await monitor.fetch({ walletAccount: DEFAULT_WALLET_ACCOUNT })

      expect(result.txs[0].sent).toBe(false)
      expect(result.txs[1].sent).toBe(false)
    })
  })
})
