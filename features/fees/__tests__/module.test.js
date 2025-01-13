import { connectAssetsList } from '@exodus/assets'
import { createInMemoryAtom } from '@exodus/atoms'
import {
  accountStatesAtomDefinition,
  txLogsAtomDefinition,
} from '@exodus/blockchain-metadata/atoms'
import ethereum from '@exodus/ethereum-meta'
import { WalletAccount } from '@exodus/models'

import feesModuleDefinition from '../module'

const createFees = feesModuleDefinition.factory

describe('fees.getFee', () => {
  let feeMonitors,
    accountStatesAtom,
    txLogsAtom,
    assetsModule,
    feesModule,
    assets,
    logger,
    addressProvider

  beforeEach(async () => {
    const walletAccounts = {
      [WalletAccount.DEFAULT_NAME]: WalletAccount.DEFAULT,
    }
    assets = connectAssetsList([...ethereum]) // shallow clone the metas
    assetsModule = {
      getAsset: (name) => assets[name],
      getAssets: () => assets,
    }

    addressProvider = { getReceiveAddress: () => '0xReciverAddress' }

    expect(assets.ethereum.api).toBeUndefined()

    logger = {
      error: jest.fn(),
    }

    txLogsAtom = txLogsAtomDefinition.factory()
    accountStatesAtom = accountStatesAtomDefinition.factory()

    feeMonitors = { getFeeData: jest.fn() }

    assets.ethereum.address = {
      validate: (address) => address.startsWith('0x'),
    }

    feesModule = createFees({
      feeMonitors,
      accountStatesAtom,
      txLogsAtom,
      assetsModule,
      logger,
      addressProvider,
      walletAccounts: createInMemoryAtom({ defaultValue: walletAccounts }),
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should return value when getFeeAsync', async () => {
    const extraFee = assets.ethereum.currency.baseUnit(300)
    const fee = assets.ethereum.currency.baseUnit(200)

    assets.ethereum.api = {
      getFeeAsync: jest.fn().mockResolvedValue({
        fee,
        gasLimit: 100,
        extraFeeData: { extraFee },
      }),
    }

    const feeData = { gasPrice: 100 }
    feeMonitors.getFeeData.mockResolvedValue(feeData)

    const walletAccount = 'exodus_0'
    const result = await feesModule.getFees({
      toAddress: '0xb794f5ea0ba39494ce839613fffba74279579268',
      assetName: 'ethereum',
      walletAccount,
    })

    expect(result).toEqual({
      fee,
      gasLimit: 100,
      extraFeeData: { extraFee },
    })

    expect(assets.ethereum.api.getFeeAsync).toBeCalledWith({
      asset: assets.ethereum,
      walletAccount,
      feeData,
      toAddress: '0xb794f5ea0ba39494ce839613fffba74279579268',
      fromAddress: '0xReciverAddress',
    })
    expect(logger.error).not.toHaveBeenCalled()
  })

  it('should return value when getFeeAsync with a token', async () => {
    const fee = assets.ethereum.currency.baseUnit(200)
    assets.ethereum.api = {
      getFeeAsync: jest.fn().mockResolvedValue({ fee, gasLimit: 100 }),
    }

    const feeData = { gasPrice: 100 }
    feeMonitors.getFeeData.mockResolvedValue(feeData)

    const walletAccount = 'exodus_0'
    const result = await feesModule.getFees({ assetName: 'augurv2', walletAccount })

    expect(result).toEqual({ fee, gasLimit: 100 })

    expect(assets.ethereum.api.getFeeAsync).toBeCalledWith({
      asset: assets.augurv2,
      walletAccount,
      feeData,
      toAddress: undefined,
      fromAddress: '0xReciverAddress',
    })
    expect(logger.error).not.toHaveBeenCalled()
  })

  it('should return value when getFee', async () => {
    const extraFee = assets.ethereum.currency.baseUnit(300)

    const fee = assets.ethereum.currency.baseUnit(200)
    assets.ethereum.api = {
      getFee: jest.fn().mockReturnValue({
        fee,
        gasLimit: 200,
        extraFee, // unify me
      }),
    }

    const feeData = { gasPrice: 100 }
    feeMonitors.getFeeData.mockResolvedValue(feeData)

    const walletAccount = 'exodus_0'

    txLogsAtom.set({ value: { [walletAccount]: { ethereum: 'SomeTxLog' } } })

    accountStatesAtom.set({ value: { [walletAccount]: { ethereum: 'SomeAccountState' } } })

    const result = await feesModule.getFees({
      assetName: 'ethereum',
      toAddress: '',
      walletAccount,
    })

    expect(result).toEqual({ fee, gasLimit: 200, extraFeeData: { extraFee } })

    expect(assets.ethereum.api.getFee).toBeCalledWith({
      asset: assets.ethereum,
      feeData,
      accountState: 'SomeAccountState',
      txSet: 'SomeTxLog',
      fromAddress: '0xReciverAddress',
      toAddress: undefined,
    })
    expect(logger.error).not.toHaveBeenCalled()
  })

  it('should return value when getFee and async fails', async () => {
    const fee = assets.ethereum.currency.baseUnit(200)
    assets.ethereum.api = {
      getFee: jest.fn().mockReturnValue({ fee, gasLimit: 200, somethingElse: true }),
      getFeeAsync: jest.fn().mockRejectedValue(new Error('fail me')),
    }

    const feeData = { gasPrice: 100 }
    feeMonitors.getFeeData.mockResolvedValue(feeData)

    const walletAccount = 'exodus_0'

    txLogsAtom.set({ value: { [walletAccount]: { ethereum: 'SomeTxLog' } } })

    accountStatesAtom.set({ value: { [walletAccount]: { ethereum: 'SomeAccountState' } } })

    const result = await feesModule.getFees({
      assetName: 'ethereum',
      walletAccount,
      toAddress: 'brokenAddress',
      fromAddress: '0xAnotherReciverAddress',
    })

    expect(result).toEqual({ fee, gasLimit: 200, somethingElse: true })

    expect(assets.ethereum.api.getFee).toBeCalledWith({
      asset: assets.ethereum,
      feeData,
      accountState: 'SomeAccountState',
      txSet: 'SomeTxLog',
      fromAddress: '0xAnotherReciverAddress',
      toAddress: undefined,
    })

    expect(logger.error).toHaveBeenCalled()
  })

  it('should use static fee from feeData when not api is not implemented', async () => {
    const fee = assets.ethereum.currency.baseUnit(3000)

    const feeData = { fee, gasPrice: 100 }
    feeMonitors.getFeeData.mockResolvedValue(feeData)

    const walletAccount = 'exodus_0'

    const result = await feesModule.getFees({ assetName: 'ethereum', walletAccount })

    expect(result).toEqual({ fee })
    expect(logger.error).not.toHaveBeenCalled()
  })
})
