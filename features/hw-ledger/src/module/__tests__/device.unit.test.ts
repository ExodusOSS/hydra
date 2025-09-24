import pDefer from 'p-defer'

import { LedgerDevice } from '../device'

const mockHandlers = {
  getAddress: jest.fn(),
  getXPub: jest.fn(),
  getPublicKey: jest.fn(),
  signTransaction: jest.fn(),
  signMessage: jest.fn(),
}

const mockAppHandlers = {
  getInformation: jest.fn(),
  listApplications: jest.fn(),
  openApplication: jest.fn(),
  quitApplication: jest.fn(),
}

const mockTransport = {
  close: jest.fn().mockResolvedValue(null),
}

const mockTransportFactory = {
  open: jest.fn().mockResolvedValue(mockTransport),
}

jest.mock('../assets', () => {
  const actual = jest.requireActual('../assets')
  return {
    ...actual,
    assetApplications: {
      bitcoin: {
        applications: [
          {
            applicationName: 'Bitcoin',
            supportedVersions: '2.x.x',
          },
        ],
        handler: async () => mockHandlers,
      },
    },
  }
})

jest.mock('../management/application', () => ({
  createApplicationManager: async () => mockAppHandlers,
}))

const assetName = 'bitcoin'
const derivationPath = "m/44'/0'/0'/0/0"

describe('LedgerDevice', () => {
  const device = new LedgerDevice({
    transportFactory: mockTransportFactory,
    descriptor: 'empty',
  })

  beforeEach(() => {
    mockAppHandlers.getInformation.mockResolvedValue({
      name: 'Bitcoin',
      version: '2.0.0',
      flags: Buffer.from('00', 'hex'),
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('.constructor()', () => {
    it('should work', async () => {
      expect(
        () =>
          new LedgerDevice({
            transportFactory: mockTransportFactory,
            descriptor: 'empty',
          })
      ).not.toThrow()
    })
  })

  describe('.ensureApplicationIsOpened()', () => {
    it('should get information when doing asset calls', async () => {
      await device.getAddress({
        assetName,
        derivationPath,
      })

      expect(mockAppHandlers.getInformation).toHaveBeenCalled()
    })

    it('should quit application & re-open application if not in the right one', async () => {
      mockAppHandlers.getInformation.mockResolvedValueOnce({
        name: 'Ethereum',
        version: '2.0.0',
        flags: Buffer.from('00', 'hex'),
      })

      await device.getAddress({
        assetName,
        derivationPath,
      })

      expect(mockAppHandlers.getInformation).toHaveBeenCalledTimes(2)
      expect(mockAppHandlers.quitApplication).toHaveBeenCalled()
      expect(mockAppHandlers.openApplication).toHaveBeenCalled()
    })

    it('should throw if not supported version', async () => {
      mockAppHandlers.getInformation.mockResolvedValueOnce({
        name: 'Bitcoin',
        version: '1.0.0',
        flags: Buffer.from('00', 'hex'),
      })

      await expect(() =>
        device.getAddress({
          assetName,
          derivationPath,
        })
      ).rejects.toThrow('does not meet version requirements')

      expect(mockAppHandlers.getInformation).toHaveBeenCalled()
    })
  })

  describe('.listSupportedAssetNames()', () => {
    it('should get return the correct list of supported assets', async () => {
      const supportedAssets = await device.listSupportedAssetNames()
      expect(supportedAssets).toEqual([
        'basemainnet',
        'bitcoin',
        'bitcointestnet',
        'bitcoinregtest',
        'matic',
        'solana',
        'ethereum',
        'ethereumsepolia',
        'tronmainnet',
      ])
    })
  })

  describe('.listInstalledAssetNames()', () => {
    it('should return the correct asset names', async () => {
      mockAppHandlers.listApplications.mockResolvedValueOnce([
        {
          name: 'Bitcoin',
          hash: '21b1ec9ed4792f21d83c98116a488a0ca450ae80ba170bf8803d9a3d6a66dc16',
          hash_code_data: 'efcd11f59b3031324556fc64cdf45bd7c4941908385b0dc4a978b71b722d0489',
          blocks: 2067,
          flags: 51_792,
        },
      ])
      const installedAssets = await device.listInstalledAssetNames()

      expect(installedAssets).toEqual(['bitcoin', 'bitcointestnet', 'bitcoinregtest'])
    })

    it('should not return unsupported asset names', async () => {
      mockAppHandlers.listApplications.mockResolvedValueOnce([
        {
          name: 'Shitcoin',
          hash: '21b1ec9ed4792f21d83c98116a488a0ca450ae80ba170bf8803d9a3d6a66dc16',
          hash_code_data: 'efcd11f59b3031324556fc64cdf45bd7c4941908385b0dc4a978b71b722d0489',
          blocks: 2067,
          flags: 51_792,
        },
      ])
      const installedAssets = await device.listInstalledAssetNames()

      expect(installedAssets).toEqual([])
    })

    it('should quit application current application if required', async () => {
      mockAppHandlers.getInformation.mockResolvedValueOnce({
        name: 'Ethereum',
        version: '2.0.0',
        flags: Buffer.from('00', 'hex'),
      })

      mockAppHandlers.listApplications.mockResolvedValueOnce([
        {
          name: 'Bitcoin',
          hash: '21b1ec9ed4792f21d83c98116a488a0ca450ae80ba170bf8803d9a3d6a66dc16',
          hash_code_data: 'efcd11f59b3031324556fc64cdf45bd7c4941908385b0dc4a978b71b722d0489',
          blocks: 2067,
          flags: 51_792,
        },
      ])
      const installedAssets = await device.listInstalledAssetNames()

      expect(installedAssets).toEqual(['bitcoin', 'bitcointestnet', 'bitcoinregtest'])
      expect(mockAppHandlers.getInformation).toHaveBeenCalledTimes(1)
      expect(mockAppHandlers.quitApplication).toHaveBeenCalledTimes(1)
    })
  })

  describe('.getAddress()', () => {
    it('should call asset handler', async () => {
      const result = 'address'
      mockHandlers.getAddress.mockResolvedValueOnce(result)

      const params = {
        assetName,
        derivationPath,
      }
      const address = await device.getAddress(params)

      expect(address).toBe(result)
      expect(mockHandlers.getAddress).toHaveBeenCalledWith(params)
    })

    it('should throw if unsupported assetName', async () => {
      await expect(() =>
        device.getAddress({
          assetName: 'UNSUPPORTED_ASSET',
          derivationPath,
        })
      ).rejects.toThrow()
    })
  })

  describe('.getXPub()', () => {
    it('should call asset handler', async () => {
      const result = 'xpub'
      mockHandlers.getXPub.mockResolvedValueOnce(result)

      const params = {
        assetName,
        derivationPath,
      }
      const xpub = await device.getXPub(params)

      expect(xpub).toBe(result)
      expect(mockHandlers.getXPub).toHaveBeenCalledWith(params)
    })
  })

  describe('.getPublicKey()', () => {
    it('should call asset handler', async () => {
      const result = 'publicKey'
      mockHandlers.getPublicKey.mockResolvedValueOnce(result)

      const params = {
        assetName,
        derivationPath,
      }
      const publicKey = await device.getPublicKey(params)

      expect(publicKey).toBe(result)
      expect(mockHandlers.getPublicKey).toHaveBeenCalledWith(params)
    })
  })

  describe('.signTransaction()', () => {
    it('should call asset handler', async () => {
      const result = 'signedTransaction'
      mockHandlers.signTransaction.mockResolvedValueOnce(result)

      const params = {
        assetName,
      }
      const signedTransaction = await device.signTransaction(params)

      expect(signedTransaction).toBe(result)
      expect(mockHandlers.signTransaction).toHaveBeenCalledWith(params)
    })
  })

  describe('.signMessage()', () => {
    it('should call asset handler', async () => {
      const result = 'signedMessage'
      mockHandlers.signMessage.mockResolvedValueOnce(result)

      const params = {
        assetName,
      }
      const signedMessage = await device.signMessage(params)

      expect(signedMessage).toBe(result)
      expect(mockHandlers.signMessage).toHaveBeenCalledWith(params)
    })
  })

  describe('.cancelAction()', () => {
    it('should  do nothing if no action is active', async () => {
      await device.cancelAction()
      expect(mockTransport.close).not.toHaveBeenCalled()
    })

    it('should cancel action', async () => {
      const deferred = pDefer()
      mockHandlers.getAddress.mockReturnValue(deferred.promise)

      const addressPromise = device.getAddress({
        assetName,
        derivationPath,
      })

      // Closes  the transport of getAddress call
      await device.cancelAction()
      // Closing the transport should throw an error, resolve for sake of test
      deferred.resolve()
      await addressPromise

      // Both the operation & the cancel action should've tried closing the transport
      expect(mockTransport.close).toHaveBeenCalledTimes(2)
    })
  })
})
