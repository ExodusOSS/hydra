import type { TrezorEvents } from '@exodus/trezor-events'

import { TrezorDevice } from '../device'
import { TrezorDiscovery } from '../discovery'

describe('TrezorDiscovery', () => {
  let mockPlatformInfo: any
  let mockPairingPromptAtom: any
  let mockThpCredentialsAtom: any
  let mockLogger: any
  let mockConfig: any

  beforeEach(() => {
    mockPlatformInfo = {
      get: jest.fn().mockResolvedValue({
        device: { manufacturer: 'Test Device' },
      }),
    }
    mockPairingPromptAtom = {
      get: jest.fn().mockResolvedValue({}),
      set: jest.fn().mockResolvedValue({}),
    }
    mockThpCredentialsAtom = {
      get: jest.fn().mockResolvedValue({}),
      set: jest.fn().mockResolvedValue({}),
    }
    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }
    mockConfig = {
      transportType: 'bluetooth',
      bluetoothScannerTimeout: 10_000,
    }
  })

  it('should create TrezorDiscovery instance', () => {
    const mockAssetsModule = {
      getAssets: jest.fn().mockReturnValue({}),
      getAsset: jest.fn(),
      getBaseAssetNames: jest.fn().mockReturnValue([]),
    }
    const discovery = new TrezorDiscovery(
      mockPlatformInfo,
      mockPairingPromptAtom,
      mockThpCredentialsAtom,
      mockLogger,
      mockConfig,
      mockAssetsModule
    )
    expect(discovery).toBeInstanceOf(TrezorDiscovery)
  })

  it('should have connected property', () => {
    const mockAssetsModule = {
      getAssets: jest.fn().mockReturnValue({}),
      getAsset: jest.fn(),
      getBaseAssetNames: jest.fn().mockReturnValue([]),
    }
    const discovery = new TrezorDiscovery(
      mockPlatformInfo,
      mockPairingPromptAtom,
      mockThpCredentialsAtom,
      mockLogger,
      mockConfig,
      mockAssetsModule
    )
    expect(discovery.connected).toBeFalsy()
  })
})

describe('TrezorDevice', () => {
  let mockEvents: TrezorEvents
  let mockDescriptor: any
  let mockAssetsModule: any

  beforeEach(() => {
    mockEvents = {
      getAddress: jest.fn(),
      getXPub: jest.fn(),
      getPublicKey: jest.fn(),
      signTransaction: jest.fn(),
    } as any

    mockDescriptor = {
      name: 'Test Trezor',
      manufacturer: 'trezor',
      model: 'Safe 7',
      transport: 'tcp',
    }

    // Create mock assets for trezor-meta
    // Safe 7 supports these base assets according to trezor-meta
    const mockAssets = {
      bcash: { name: 'bcash', baseAsset: { name: 'bcash' }, assetType: 'BITCOIN_LIKE' },
      bitcoin: { name: 'bitcoin', baseAsset: { name: 'bitcoin' }, assetType: 'BITCOIN_LIKE' },
      bitcoinregtest: {
        name: 'bitcoinregtest',
        baseAsset: { name: 'bitcoinregtest' },
        assetType: 'BITCOIN_LIKE',
      },
      cardano: { name: 'cardano', baseAsset: { name: 'cardano' }, assetType: 'CARDANO' },
      dogecoin: { name: 'dogecoin', baseAsset: { name: 'dogecoin' }, assetType: 'BITCOIN_LIKE' },
      ethereum: { name: 'ethereum', baseAsset: { name: 'ethereum' }, assetType: 'ETHEREUM_LIKE' },
      ethereumclassic: {
        name: 'ethereumclassic',
        baseAsset: { name: 'ethereumclassic' },
        assetType: 'ETHEREUM_LIKE',
      },
      litecoin: { name: 'litecoin', baseAsset: { name: 'litecoin' }, assetType: 'BITCOIN_LIKE' },
      ripple: { name: 'ripple', baseAsset: { name: 'ripple' }, assetType: 'RIPPLE' },
      solana: { name: 'solana', baseAsset: { name: 'solana' }, assetType: 'SOLANA' },
      stellar: { name: 'stellar', baseAsset: { name: 'stellar' }, assetType: 'STELLAR' },
      zcash: { name: 'zcash', baseAsset: { name: 'zcash' }, assetType: 'BITCOIN_LIKE' },
      // Add a token that should be filtered out
      'ethereum-usdc': {
        name: 'ethereum-usdc',
        baseAsset: { name: 'ethereum' },
        assetType: 'ETHEREUM_ERC20',
      },
    }

    mockAssetsModule = {
      getAssets: jest.fn().mockReturnValue(mockAssets),
      getAsset: jest.fn((name: string) => mockAssets[name]),
      getBaseAssetNames: jest
        .fn()
        .mockReturnValue(
          Object.keys(mockAssets).filter((name) => mockAssets[name].baseAsset.name === name)
        ),
    }
  })

  it('should create TrezorDevice instance', () => {
    const device = new TrezorDevice(mockEvents, mockDescriptor, mockAssetsModule)
    expect(device).toBeInstanceOf(TrezorDevice)
    expect(device.descriptor).toBe(mockDescriptor)
  })

  it('should list supported assets', async () => {
    const device = new TrezorDevice(mockEvents, mockDescriptor, mockAssetsModule)
    const assets = await device.listSupportedAssetNames()
    // Should include base assets for Safe 7 model (which includes solana)
    expect(assets).toContain('bitcoin')
    expect(assets).toContain('ethereum')
    expect(assets).toContain('solana')
    // Should not include tokens
    expect(assets).not.toContain('ethereum-usdc')
  })
})
