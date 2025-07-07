import { createInMemoryAtom } from '@exodus/atoms'

import nftsDefinition from '../index.js'

const logger = { log: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() }

const createFusionMock = (defaultValue = {}) => ({
  channel: jest.fn((options) => {
    const response = {
      awaitProcessed: jest.fn(() => new Promise((resolve) => setTimeout(resolve, 1))),
      push: jest.fn(),
    }

    options.processOne({ data: defaultValue })

    return response
  }),
})

describe('nfts', () => {
  describe('constructor', () => {
    it('should construct', () => {
      const fusion = createFusionMock()
      const nftsConfigAtom = createInMemoryAtom({ defaultValue: {} })
      const nftsOptimisticAtom = createInMemoryAtom({ defaultValue: {} })

      expect(() =>
        nftsDefinition.factory({ fusion, nftsConfigAtom, logger, nftsOptimisticAtom })
      ).not.toThrow()
    })
  })

  describe('load', () => {
    it('should only open the fusion channel after load', async () => {
      const fusion = createFusionMock()
      const nftsConfigAtom = createInMemoryAtom({ defaultValue: {} })
      const nftsOptimisticAtom = createInMemoryAtom({ defaultValue: {} })

      const nfts = nftsDefinition.factory({ fusion, nftsConfigAtom, logger, nftsOptimisticAtom })

      expect(fusion.channel).toBeCalledTimes(0)
      await nfts.load()
      expect(fusion.channel).toBeCalledTimes(1)

      await nfts.load()
      expect(fusion.channel).toBeCalledTimes(1)
    })

    it('should resolve subsequent load promises after load finished', async () => {
      const fusion = createFusionMock()
      const nftsConfigAtom = createInMemoryAtom({ defaultValue: {} })
      const nftsOptimisticAtom = createInMemoryAtom({ defaultValue: {} })

      const nfts = nftsDefinition.factory({ fusion, nftsConfigAtom, nftsOptimisticAtom, logger })

      expect(fusion.channel).toBeCalledTimes(0)
      const firstLoad = nfts.load()
      const secondLoad = nfts.load()

      const resolvedEarly = await Promise.race([secondLoad, Promise.resolve('too early')])
      expect(resolvedEarly).toBe('too early')

      await firstLoad
      expect(fusion.channel).toBeCalledTimes(1)

      const resolved = await Promise.race([secondLoad, Promise.resolve('not yet')])
      expect(resolved).not.toBe('not yet')
    })

    it('should populate the nftsConfigsAtom after load', async () => {
      const fusionPayload = {
        'algorand:453046935': { hidden: false },
        'algorand:860213877': { customPrice: 2 },
        'bnb:0xadc466855ebe8d1402c5f7e6706fccc3aedb44a0/0x8abc1': { hidden: true },
      }

      const fusion = createFusionMock(fusionPayload)
      const nftsConfigAtom = createInMemoryAtom({ defaultValue: {} })
      const nftsOptimisticAtom = createInMemoryAtom({ defaultValue: {} })

      const nfts = nftsDefinition.factory({ fusion, nftsConfigAtom, nftsOptimisticAtom, logger })

      await nfts.load()
      expect(await nftsConfigAtom.get()).toStrictEqual(fusionPayload)
    })
  })

  describe('upsertConfig', () => {
    it('should add a new nft config', async () => {
      const fusionPayload = {
        'algorand:453046935': { hidden: false },
        'algorand:860213877': { customPrice: 2 },
      }

      const fusion = createFusionMock(fusionPayload)
      const nftsConfigAtom = createInMemoryAtom({ defaultValue: {} })
      const nftsOptimisticAtom = createInMemoryAtom({ defaultValue: {} })

      const nfts = nftsDefinition.factory({ fusion, nftsConfigAtom, nftsOptimisticAtom, logger })

      await nfts.load()
      await nfts.upsertConfig({ id: 'algorand:1234', hidden: false })

      expect(await nftsConfigAtom.get()).toStrictEqual({
        ...fusionPayload,
        'algorand:1234': { hidden: false },
      })
    })

    it('should update a previously existing nft config', async () => {
      const fusionPayload = {
        'algorand:453046935': { hidden: false },
        'algorand:860213877': { customPrice: 2 },
      }

      const fusion = createFusionMock(fusionPayload)
      const nftsConfigAtom = createInMemoryAtom({ defaultValue: {} })
      const nftsOptimisticAtom = createInMemoryAtom({ defaultValue: {} })

      const nfts = nftsDefinition.factory({ fusion, nftsConfigAtom, nftsOptimisticAtom, logger })

      await nfts.load()
      await nfts.upsertConfig({ id: 'algorand:453046935', hidden: true })

      expect(await nftsConfigAtom.get()).toStrictEqual({
        ...fusionPayload,
        'algorand:453046935': { hidden: true },
      })
    })
  })

  describe('upsertConfigs', () => {
    it('should add a new set of nfts configs', async () => {
      const fusionPayload = {
        'algorand:453046935': { hidden: false },
        'algorand:860213877': { customPrice: 2 },
      }

      const fusion = createFusionMock(fusionPayload)
      const nftsConfigAtom = createInMemoryAtom({ defaultValue: {} })
      const nftsOptimisticAtom = createInMemoryAtom({ defaultValue: {} })

      const nfts = nftsDefinition.factory({ fusion, nftsConfigAtom, nftsOptimisticAtom, logger })

      await nfts.load()
      await nfts.upsertConfigs([
        { id: 'algorand:1234', hidden: false },
        { id: 'algorand:5678', hidden: true },
      ])

      expect(await nftsConfigAtom.get()).toStrictEqual({
        ...fusionPayload,
        'algorand:1234': { hidden: false },
        'algorand:5678': { hidden: true },
      })
    })

    it('should update a set of previously existing nfts configs', async () => {
      const fusionPayload = {
        'algorand:453046935': { hidden: false },
        'algorand:860213877': { customPrice: 2 },
      }

      const fusion = createFusionMock(fusionPayload)
      const nftsConfigAtom = createInMemoryAtom({ defaultValue: {} })
      const nftsOptimisticAtom = createInMemoryAtom({ defaultValue: {} })

      const nfts = nftsDefinition.factory({ fusion, nftsConfigAtom, nftsOptimisticAtom, logger })

      await nfts.load()
      await nfts.upsertConfigs([
        { id: 'algorand:453046935', hidden: true },
        { id: 'algorand:860213877', customPrice: 2, hidden: false },
      ])

      expect(await nftsConfigAtom.get()).toStrictEqual({
        ...fusionPayload,
        'algorand:453046935': { hidden: true },
        'algorand:860213877': { customPrice: 2, hidden: false },
      })
    })
  })

  describe('clear', () => {
    test('should clear atoms', async () => {
      const fusionPayload = {
        'algorand:453046935': { hidden: false },
        'algorand:860213877': { customPrice: 2 },
      }

      const fusion = createFusionMock(fusionPayload)
      const nftsOptimisticAtom = createInMemoryAtom({ defaultValue: {} })
      const nftsConfigAtom = createInMemoryAtom({ defaultValue: {} })
      const nfts = nftsDefinition.factory({ fusion, nftsConfigAtom, nftsOptimisticAtom, logger })

      await nfts.load()
      await nfts.clear()

      await expect(nftsConfigAtom.get()).resolves.toEqual({})
      await expect(nftsOptimisticAtom.get()).resolves.toEqual({})
    })
  })

  describe('setOptimisticNft', () => {
    test('should set optimistic nft data and clear after timeout', async () => {
      jest.useFakeTimers({ doNotFake: ['setImmediate'] })
      const advance = async (ms) => {
        jest.advanceTimersByTime(ms)
        await new Promise(setImmediate)
      }

      const fusion = createFusionMock()
      const nftsConfigAtom = createInMemoryAtom({ defaultValue: {} })
      const nftsOptimisticAtom = createInMemoryAtom({ defaultValue: {} })

      const nfts = nftsDefinition.factory({ fusion, nftsConfigAtom, nftsOptimisticAtom, logger })
      const CLEAR_AFTER = 1000
      const expiresAt = Date.now() + CLEAR_AFTER
      await nfts.setOptimisticNft(
        { id: 'foo', network: 'solana', walletAccount: 'exodus_0' },
        { listed: true, expiresAt }
      )
      const current = await nftsOptimisticAtom.get()
      expect(current).toEqual({
        exodus_0: {
          solana: {
            foo: {
              expiresAt,
              listed: true,
            },
          },
        },
      })
      await advance(CLEAR_AFTER)
      const afterClear = await nftsOptimisticAtom.get()
      expect(afterClear).toEqual({})
    })

    test('should not clear if new data set', async () => {
      jest.useFakeTimers({ doNotFake: ['setImmediate'] })
      const advance = async (ms) => {
        jest.advanceTimersByTime(ms)
        await new Promise(setImmediate)
      }

      const fusion = createFusionMock()
      const nftsConfigAtom = createInMemoryAtom({ defaultValue: {} })
      const nftsOptimisticAtom = createInMemoryAtom({ defaultValue: {} })

      const nfts = nftsDefinition.factory({ fusion, nftsConfigAtom, nftsOptimisticAtom, logger })
      const CLEAR_AFTER = 1000
      const CLEAR_AFTER2 = 2000
      const expiresAt = Date.now() + CLEAR_AFTER
      await nfts.setOptimisticNft(
        { id: 'foo', network: 'solana', walletAccount: 'exodus_0' },
        { listed: true, expiresAt }
      )
      const current = await nftsOptimisticAtom.get()
      expect(current).toEqual({
        exodus_0: {
          solana: {
            foo: {
              expiresAt,
              listed: true,
            },
          },
        },
      })
      const expiresAt2 = Date.now() + CLEAR_AFTER2
      await nfts.setOptimisticNft(
        { id: 'foo', network: 'solana', walletAccount: 'exodus_0' },
        { listed: false, expiresAt: expiresAt2 }
      )

      await advance(CLEAR_AFTER)
      const afterClear = await nftsOptimisticAtom.get()
      expect(afterClear).toEqual({
        exodus_0: {
          solana: {
            foo: {
              expiresAt: expiresAt2,
              listed: false,
            },
          },
        },
      })

      await advance(CLEAR_AFTER2)
      const afterClear2 = await nftsOptimisticAtom.get()
      expect(afterClear2).toEqual({})
    })
  })
})
