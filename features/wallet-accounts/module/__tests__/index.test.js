import { createAtomMock } from '@exodus/atoms'
import { WalletAccount } from '@exodus/models'
import { SEED_SRC } from '@exodus/models/lib/wallet-account/index.js'
import createInMemoryStorage from '@exodus/storage-memory'
import pDefer from 'p-defer'

import createWalletAccountsAtom from '../../atoms/wallet-accounts.js'
import createWalletAccountsInternalAtom from '../../atoms/wallet-accounts-internal.js'
import { create as createWalletAccounts } from '../index.js'

const { TREZOR_SRC, EXODUS_SRC, FTX_SRC, DEFAULT_NAME } = WalletAccount

describe('WalletAccounts', () => {
  const primarySeedId = 'aGkgbWFyaw=='
  const stored = {
    exodus_0: {
      color: '#ff3974',
      enabled: true,
      icon: 'exodus',
      index: 0,
      label: 'Exodus',
      source: 'exodus',
      seedId: primarySeedId,
      isMultisig: false,
    },
    exodus_1: {
      color: '#30d968',
      enabled: true,
      icon: 'trezor',
      index: 1,
      label: 'asdf',
      source: 'exodus',
      seedId: primarySeedId,
      isMultisig: false,
    },
  }

  const prepare = async ({
    walletAccounts = stored,
    allowedSources = [EXODUS_SRC],
    activeWalletAccount = DEFAULT_NAME,
    config,
    load = true,
    ...deps
  } = {}) => {
    let processOneDefer
    let channelOptions
    const channel = jest.fn((options = {}) => {
      channelOptions = {
        ...options,
        processOne: async (...args) => {
          processOneDefer = pDefer()
          if (options.processOne) {
            await options.processOne(...args)
          }

          processOneDefer.resolve()
        },
      }
      return {
        awaitProcessed,
        push: pushToFusion,
        tail,
      }
    })
    const pushToFusion = jest.fn((data) => channelOptions.processOne(data))
    const tail = jest.fn()
    const awaitProcessed = jest.fn(async () => {
      await processOneDefer?.promise
    })

    const fusionMock = {
      channel,
    }

    const converted = Object.fromEntries(
      Object.entries(walletAccounts).map(([key, value]) => [key, new WalletAccount(value)])
    )

    const wallet = { getPrimarySeedId: async () => primarySeedId }
    const walletAccountsInternalAtom = createWalletAccountsInternalAtom({
      storage: createInMemoryStorage(),
      config: {},
    })
    await walletAccountsInternalAtom.set(converted)

    const walletAccountsAtom = createWalletAccountsAtom({
      walletAccountsInternalAtom,
    })

    const activeWalletAccountAtom = createAtomMock({ defaultValue: activeWalletAccount })
    const hardwareWalletPublicKeysAtom = createAtomMock({ defaultValue: {} })

    walletAccountsAtom.set = jest.fn(walletAccountsAtom.set)

    const module = createWalletAccounts({
      walletAccountsAtom,
      walletAccountsInternalAtom,
      wallet,
      activeWalletAccountAtom,
      hardwareWalletPublicKeysAtom,
      fusion: fusionMock,
      config: { allowedSources, ...config },
      ...deps,
    })

    if (load) {
      await module.load()
    }

    return {
      walletAccounts: module,
      walletAccountsAtom,
      hardwareWalletPublicKeysAtom,
      fusionMock,
      channelOptions,
      pushToFusion,
      awaitProcessed,
      tail,
      walletAccountsInternalAtom,
    }
  }

  describe('methods', () => {
    describe('load', () => {
      it('should load data', async () => {
        const { walletAccounts, walletAccountsAtom, fusionMock } = await prepare()

        expect(walletAccountsAtom.set).not.toHaveBeenCalled()

        expect(fusionMock.channel).toHaveBeenCalled()

        expect(walletAccounts.get('exodus_0')).toEqual(stored.exodus_0)
        expect(walletAccounts.get('exodus_1')).toEqual(stored.exodus_1)
      })
    })

    describe('create', () => {
      it('should create new wallet account', async () => {
        const { walletAccounts, walletAccountsAtom } = await prepare()

        const walletAccount1 = await walletAccounts.create({
          label: 'New',
          color: '#ff0000',
          icon: 'exodus',
        })

        expect(walletAccount1).toMatchObject({
          label: 'New',
          index: 2,
          seedId: primarySeedId,
        })

        const walletAccount2 = await walletAccounts.create({
          label: 'Another',
          color: '#ff0000',
          icon: 'exodus',
        })

        expect(walletAccount2).toMatchObject({
          label: 'Another',
          index: 3,
          seedId: primarySeedId,
        })

        const all = await walletAccountsAtom.get()

        expect(all).toMatchObject({
          exodus_2: {
            label: 'New',
            index: 2,
            seedId: primarySeedId,
          },
          exodus_3: {
            label: 'Another',
            index: 3,
            seedId: primarySeedId,
          },
        })

        const nextIndex = walletAccounts.getNextIndex({ seedId: primarySeedId, source: EXODUS_SRC })
        expect(nextIndex).toBe(4)
      })

      it('should create new exodus account with same compatibility mode as default account', async () => {
        const compatibilityMode = 'metamask'
        const { walletAccounts, walletAccountsAtom } = await prepare({
          walletAccounts: {
            exodus_0: {
              ...stored.exodus_0,
              compatibilityMode,
            },
          },
        })

        await walletAccounts.create({
          label: 'Another',
          color: '#ff0000',
          icon: 'exodus',
        })

        const all = await walletAccountsAtom.get()

        expect(all).toEqual({
          exodus_0: expect.objectContaining({
            label: 'Exodus',
            index: 0,
            seedId: primarySeedId,
            compatibilityMode,
          }),
          exodus_1: expect.objectContaining({
            label: 'Another',
            index: 1,
            seedId: primarySeedId,
            compatibilityMode,
          }),
        })
      })

      it('should not create new seed account with same compatibility mode as default account', async () => {
        const compatibilityMode = 'metamask'
        const { walletAccounts, walletAccountsAtom } = await prepare({
          walletAccounts: {
            exodus_0: {
              ...stored.exodus_0,
              compatibilityMode,
            },
          },
        })

        await walletAccounts.create({
          label: 'seedy',
          color: '#ff0000',
          icon: 'exodus',
          seedId: 'A',
          source: SEED_SRC,
        })

        const all = await walletAccountsAtom.get()

        expect(all).toEqual({
          exodus_0: expect.objectContaining({
            label: 'Exodus',
            index: 0,
            seedId: primarySeedId,
            compatibilityMode,
          }),
          seed_0_A: expect.objectContaining({
            label: 'seedy',
            index: 0,
            seedId: 'A',
            compatibilityMode: undefined,
          }),
        })
      })

      it('should not set an index or seedId for a custodial wallet', async () => {
        const { walletAccounts } = await prepare()

        await walletAccounts.create({
          label: 'New',
          color: '#ff0000',
          id: '12357',
          source: FTX_SRC,
          icon: 'exodus',
        })

        const walletAccount = walletAccounts.get('ftx_12357')

        expect(walletAccount.index).toBeNull()
        expect(walletAccount.seedId).toBeUndefined()
      })

      it('should create new wallet account at gap index', async () => {
        const { walletAccounts } = await prepare({
          walletAccounts: {
            exodus_0: stored.exodus_0,
            exodus_2: { ...stored.exodus_0, index: 2 },
          },
          config: {
            fillIndexGapsOnCreation: true,
          },
        })

        await walletAccounts.create({
          label: 'Potters Big Stash',
          color: '#ff0000',
          icon: 'exodus',
        })

        await walletAccounts.create({
          label: 'Potters Secret Chamber',
          color: '#3f1381',
          icon: 'exodus',
        })

        const stash = walletAccounts.get('exodus_1')

        expect(stash.label).toBe('Potters Big Stash')
        expect(stash.index).toBe(1)

        const chamber = walletAccounts.get('exodus_3')
        expect(chamber.label).toBe('Potters Secret Chamber')
        expect(chamber.index).toBe(3)
      })

      it('should re-enable and update disabled wallet account at gap index', async () => {
        const { walletAccounts } = await prepare({
          walletAccounts: {
            exodus_0: stored.exodus_0,
            exodus_1: { ...stored.exodus_0, index: 1, enabled: false },
            exodus_2: { ...stored.exodus_0, index: 2 },
          },
          config: {
            fillIndexGapsOnCreation: true,
          },
        })

        await walletAccounts.create({
          label: 'Potters Big Stash',
          color: '#ff0000',
          icon: 'exodus',
        })

        const stash = walletAccounts.get('exodus_1')

        expect(stash.label).toBe('Potters Big Stash')
        expect(stash.index).toBe(1)
      })

      it('should derive separate indices for different compatibility modes and ids', async () => {
        const { walletAccounts, walletAccountsAtom } = await prepare()

        await walletAccounts.create({
          source: SEED_SRC,
          compatibilityMode: 'metamask',
          seedId: 'A',
          label: 'Potters Big Stash',
        })

        await walletAccounts.create({
          source: SEED_SRC,
          compatibilityMode: 'metamask',
          seedId: 'A',
          label: 'Potters Bigger Stash',
        })

        await walletAccounts.create({
          source: SEED_SRC,
          compatibilityMode: 'metamask',
          seedId: 'B',
          label: 'Malfoys Big Stash',
        })

        const all = await walletAccountsAtom.get()

        expect(all).toMatchObject({
          ...stored,
          seed_0_A_metamask: {
            label: 'Potters Big Stash',
            compatibilityMode: 'metamask',
            seedId: 'A',
            index: 0,
            source: 'seed',
          },
          seed_1_A_metamask: {
            compatibilityMode: 'metamask',
            label: 'Potters Bigger Stash',
            seedId: 'A',
            index: 1,
            source: 'seed',
          },
          seed_0_B_metamask: {
            label: 'Malfoys Big Stash',
            compatibilityMode: 'metamask',
            seedId: 'B',
            index: 0,
            source: 'seed',
          },
        })
      })

      it('should increment exodus index from last exodus wallet account', async () => {
        const { walletAccounts, walletAccountsAtom } = await prepare()

        await walletAccounts.create({
          source: SEED_SRC,
          compatibilityMode: 'metamask',
          seedId: 'A',
          label: 'Potters Big Stash',
        })

        await walletAccounts.create({
          source: SEED_SRC,
          compatibilityMode: 'metamask',
          seedId: 'B',
          label: 'Malfoys Big Stash',
        })

        await walletAccounts.create({
          source: EXODUS_SRC,
          label: 'Exodus Stash',
        })

        const all = await walletAccountsAtom.get()

        expect(all).toMatchObject({
          ...stored,
          seed_0_A_metamask: {
            label: 'Potters Big Stash',
            compatibilityMode: 'metamask',
            seedId: 'A',
            index: 0,
            source: 'seed',
          },
          seed_0_B_metamask: {
            label: 'Malfoys Big Stash',
            compatibilityMode: 'metamask',
            seedId: 'B',
            index: 0,
            source: 'seed',
          },
          exodus_2: {
            label: 'Exodus Stash',
            index: 2,
            source: 'exodus',
          },
        })
      })
    })

    describe('createMany', () => {
      it('should create multiple wallet accounts', async () => {
        const { walletAccounts, pushToFusion, walletAccountsInternalAtom } = await prepare()

        jest.spyOn(walletAccountsInternalAtom, 'set')

        const created = await walletAccounts.createMany([
          {
            label: 'The first new one',
          },
          {
            label: 'The second new one',
          },
        ])

        const first = walletAccounts.get('exodus_2')
        const second = walletAccounts.get('exodus_3')

        expect(first).toMatchObject(created[0])
        expect(second).toMatchObject(created[1])

        expect(first).toMatchObject({
          label: 'The first new one',
          index: 2,
          seedId: primarySeedId,
        })

        expect(second).toMatchObject({
          label: 'The second new one',
          index: 3,
          seedId: primarySeedId,
        })

        expect(pushToFusion).toHaveBeenCalledTimes(1)
        expect(walletAccountsInternalAtom.set).toHaveBeenCalledTimes(1)
      })

      it('should require a unique index per seed for source "seed"', async () => {
        const { walletAccounts } = await prepare()
        const first = {
          ...WalletAccount.DEFAULT,
          seedId: 'someSeedId',
          source: 'seed',
          index: 0,
          compatibilityMode: 'a',
        }

        await walletAccounts.createMany([first])
        await expect(
          walletAccounts.createMany([
            {
              ...first,
              compatibilityMode: 'b',
            },
          ])
        ).rejects.toThrow(/with same/)

        await expect(
          walletAccounts.createMany([
            {
              ...WalletAccount.DEFAULT,
              seedId: primarySeedId,
              source: 'seed',
              index: 0,
            },
          ])
        ).rejects.toThrow(/with same/)
      })
    })

    describe('update', () => {
      it('should update existing wallet account', async () => {
        const { walletAccounts } = await prepare()

        await walletAccounts.update('exodus_1', {
          label: 'Updated',
        })

        const walletAccount = walletAccounts.get('exodus_1')

        expect(walletAccount.label).toBe('Updated')
      })

      it('should throw when trying to disable default wallet account', async () => {
        const { walletAccounts, pushToFusion } = await prepare()

        await expect(
          walletAccounts.update('exodus_0', {
            enabled: false,
          })
        ).rejects.toThrow(/Can't disable default walletAccount/)

        const walletAccount = walletAccounts.get('exodus_0')

        expect(walletAccount.enabled).toBe(true)

        expect(pushToFusion).not.toHaveBeenCalled()
      })

      it('should throw when trying to update "seedId" on exodus wallet account with existing seed id', async () => {
        const { walletAccounts, pushToFusion } = await prepare()

        await expect(
          walletAccounts.update('exodus_0', {
            seedId: 'another one',
          })
        ).rejects.toThrow(/seedId can only be set if previously undefined/)

        const walletAccount = walletAccounts.get('exodus_0')

        expect(walletAccount.seedId).toBe(primarySeedId)
        expect(pushToFusion).not.toHaveBeenCalled()
      })

      it('should propagate update to fusion and pass through data not in allowedSources', async () => {
        const { walletAccounts, channelOptions, pushToFusion } = await prepare()

        const trezor = { source: TREZOR_SRC, index: 1, id: 1 }
        const them = {
          ...stored,
          trezor_1_1: trezor,
        }

        await channelOptions.processOne({
          data: {
            walletAccounts: them,
            accounts: Object.fromEntries(Object.keys(them).map((key) => [key, {}])),
          },
        })

        await walletAccounts.update('exodus_1', {
          label: 'Updated',
        })

        expect(pushToFusion).toHaveBeenCalledWith({
          type: 'walletAccounts',
          data: {
            walletAccounts: {
              exodus_0: new WalletAccount({ ...stored.exodus_0, seedId: primarySeedId }).toJSON(),
              exodus_1: new WalletAccount({
                ...stored.exodus_1,
                label: 'Updated',
                seedId: primarySeedId,
              }).toJSON(),
              trezor_1_1: new WalletAccount(trezor).toJSON(),
            },
            accounts: {
              exodus_0: expect.anything(),
              exodus_1: expect.anything(),
              trezor_1_1: expect.anything(),
            },
          },
        })
      })
    })

    describe('updateMany', () => {
      it('should update existing wallet accounts', async () => {
        const { walletAccounts } = await prepare()

        await walletAccounts.updateMany({
          exodus_0: {
            label: 'Updated default',
          },
          exodus_1: {
            label: 'Updated other',
          },
        })

        const defaultWalletAccount = walletAccounts.get('exodus_0')
        const otherWalletAccount = walletAccounts.get('exodus_1')

        expect(defaultWalletAccount.label).toBe('Updated default')
        expect(otherWalletAccount.label).toBe('Updated other')
      })
    })

    describe('disable', () => {
      it('should disable wallet account', async () => {
        const { walletAccounts } = await prepare()

        await walletAccounts.disable('exodus_1')

        expect(walletAccounts.get('exodus_1').enabled).toBe(false)
      })

      it('should change active account when disabled', async () => {
        const { walletAccounts } = await prepare({ activeWalletAccount: 'exodus_1' })

        await walletAccounts.disable('exodus_1')

        await expect(walletAccounts.getActive()).resolves.toBe(DEFAULT_NAME)
      })

      it('should not change active account when disabling another account', async () => {
        const { walletAccounts } = await prepare({ activeWalletAccount: 'exodus_2' })

        await walletAccounts.disable('exodus_1')

        await expect(walletAccounts.getActive()).resolves.toBe('exodus_2')
      })

      it('should throw when trying to disable default wallet account', async () => {
        const { walletAccounts } = await prepare()

        await expect(walletAccounts.disable('exodus_0')).rejects.toThrow(
          /Can't disable default walletAccount/
        )
      })

      it('should remove hardware wallet account', async () => {
        const { walletAccounts } = await prepare({
          walletAccounts: {
            ...stored,
            trezor_1_hp: { label: 'Trezor', source: TREZOR_SRC, index: 1, id: 'hp' },
          },
          allowedSources: [TREZOR_SRC, EXODUS_SRC],
        })
        expect(walletAccounts.get('trezor_1_hp')).toBeDefined()

        await walletAccounts.disable('trezor_1_hp')

        expect(walletAccounts.get('trezor_1_hp')).toBeUndefined()
      })

      it('should delete hardware wallet public keys for wallet account', async () => {
        const { walletAccounts } = await prepare({
          walletAccounts: {
            ...stored,
            trezor_1_hp: { label: 'Trezor', source: TREZOR_SRC, index: 1, id: 'hp' },
          },
          allowedSources: [TREZOR_SRC, EXODUS_SRC],
        })
        walletAccounts.setAccounts({
          trezor_1_hp: {
            'm/0/0': 'aabb',
          },
        })
        expect(walletAccounts.getAccounts()['trezor_1_hp']).toBeDefined()

        await walletAccounts.disable('trezor_1_hp')

        expect(walletAccounts.getAccounts()['trezor_1_hp']).toBeUndefined()
      })
    })

    describe('removeMany', () => {
      it('should remove multiple wallet accounts', async () => {
        const { walletAccounts, walletAccountsAtom } = await prepare({
          walletAccounts: {
            ...stored,
            exodus_2: { ...stored.exodus_0, index: 2 },
            exodus_3: { ...stored.exodus_0, index: 3 },
          },
          config: {
            fillIndexGapsOnCreation: true,
          },
        })

        await walletAccounts.removeMany(['exodus_1', 'exodus_2', 'exodus_3'])
        await expect(walletAccountsAtom.get()).resolves.toEqual({ exodus_0: stored.exodus_0 })
      })

      it('should change active account', async () => {
        const { walletAccounts } = await prepare({
          activeWalletAccount: 'exodus_1',
          config: {
            fillIndexGapsOnCreation: true,
          },
        })

        await walletAccounts.removeMany(['exodus_1'])

        await expect(walletAccounts.getActive()).resolves.toBe(DEFAULT_NAME)
      })

      it('should throw when trying to remove default wallet account', async () => {
        const { walletAccounts } = await prepare({
          config: {
            fillIndexGapsOnCreation: true,
          },
        })

        await expect(walletAccounts.removeMany(['exodus_0'])).rejects.toThrow(
          /Can't remove default walletAccount/
        )
      })

      it('should throw when fillIndexGapsOnCreation is false', async () => {
        const { walletAccounts } = await prepare()

        await expect(walletAccounts.removeMany(['exodus_1'])).rejects.toThrow(
          /removeMany can only be used in conjunction with fillIndexGapsOnCreation. Please disable instead/
        )
      })
    })

    describe('clear', () => {
      it('should remove local state and clear atom', async () => {
        const { walletAccounts, walletAccountsAtom, walletAccountsInternalAtom } = await prepare({
          walletAccounts: { exodus_0: stored.exodus_0 },
        })

        await walletAccounts.create(stored.exodus_1)

        const before = await walletAccountsAtom.get()
        expect(before.exodus_1).toBeDefined()

        await walletAccounts.clear()
        const after = await walletAccountsInternalAtom.get()

        expect(after.exodus_1).toBeUndefined()
        await expect(
          walletAccounts.update('exodus_1', { label: "Potter's Stash" })
        ).rejects.toThrow('is not a known wallet account')
      })
    })

    describe('#replaceAll', () => {
      it('should remove local hardware account when removed in remote', async () => {
        const { walletAccounts, channelOptions } = await prepare({
          walletAccounts: {
            ...stored,
            trezor_1_hp: { label: 'Trezor', source: TREZOR_SRC, index: 1, id: 'hp' },
          },
          allowedSources: [TREZOR_SRC, EXODUS_SRC],
        })

        await channelOptions.processOne({
          data: {
            walletAccounts: stored,
          },
        })

        expect(walletAccounts.get('trezor_1_hp')).toBeUndefined()
      })

      it('should skip processing in case of pending updates', async () => {
        const { walletAccounts, channelOptions } = await prepare()

        await walletAccounts.update('exodus_0', { label: 'the account' }) // simulating one pending down-sync

        await channelOptions.processOne({
          data: {
            walletAccounts: {
              ...stored,
              exodus_0: { ...stored.exodus_0, label: 'Should never be applied' },
            },
          },
        }) // down sync is assumed to be the one we just sent up

        expect(walletAccounts.get('exodus_0').label).toEqual('the account') // local change should not have been overwritten

        await channelOptions.processOne({
          data: {
            walletAccounts: {
              ...stored,
              exodus_0: { ...stored.exodus_0, label: 'Wayne Foundation' },
            },
          },
        })

        expect(walletAccounts.get('exodus_0').label).toEqual('Wayne Foundation') // no down sync pending, apply remote update
      })

      it('should set seed id on exodus wallet accounts if missing', async () => {
        const { walletAccounts, channelOptions } = await prepare()

        await channelOptions.processOne({
          data: {
            walletAccounts: {
              exodus_0: { ...stored.exodus_0, seedId: undefined },
              exodus_1: { ...stored.exodus_1, seedId: undefined },
              exodus_2: {
                ...stored.exodus_0,
                index: 2,
                label: 'Wayne Foundation',
                seedId: undefined,
              },
            },
          },
        })

        expect(
          Object.values(walletAccounts.getAll()).every((it) => it.seedId === primarySeedId)
        ).toBe(true)
      })

      it('should inherit compatibility mode on exodus wallet accounts from default wallet account', async () => {
        const compatibilityMode = 'metamask'
        const { channelOptions, walletAccountsAtom } = await prepare({
          allowedSources: [EXODUS_SRC, SEED_SRC],
          walletAccounts: {
            exodus_0: {
              ...stored.exodus_0,
              compatibilityMode,
            },
          },
        })

        const seedAccount = {
          ...stored.exodus_0,
          index: 1,
          source: SEED_SRC,
          label: 'Wayne Foundation',
          seedId: 'A',
        }

        await channelOptions.processOne({
          data: {
            walletAccounts: {
              exodus_0: stored.exodus_0,
              exodus_1: stored.exodus_1,
              seed_1_A: seedAccount,
            },
          },
        })

        const all = await walletAccountsAtom.get()

        expect(all).toEqual({
          exodus_0: expect.objectContaining({ ...stored.exodus_0, compatibilityMode }),
          exodus_1: expect.objectContaining({ ...stored.exodus_1, compatibilityMode }),
          seed_1_A: expect.objectContaining({ ...seedAccount, compatibilityMode: undefined }),
        })
      })

      it('should inherit compatibility mode when syncing down before load', async () => {
        const compatibilityMode = 'metamask'
        const { channelOptions, walletAccountsAtom, walletAccounts } = await prepare({
          allowedSources: [EXODUS_SRC, SEED_SRC],
          walletAccounts: {},
          load: false,
        })

        const whenProcessed = channelOptions.processOne({
          data: {
            walletAccounts: {
              exodus_0: stored.exodus_0,
              exodus_1: stored.exodus_1,
            },
          },
        })

        await walletAccountsAtom.set({
          exodus_0: new WalletAccount({ ...stored.exodus_0, compatibilityMode }),
        })

        await walletAccounts.load()

        await whenProcessed

        const all = await walletAccountsAtom.get()

        expect(all).toEqual({
          exodus_0: expect.objectContaining({ ...stored.exodus_0, compatibilityMode }),
          exodus_1: expect.objectContaining({ ...stored.exodus_1, compatibilityMode }),
        })
      })
    })

    describe('enable', () => {
      it('should enable wallet account', async () => {
        const { walletAccounts } = await prepare()

        await walletAccounts.disable('exodus_1')

        await walletAccounts.enable('exodus_1')

        expect(walletAccounts.get('exodus_1').enabled).toBe(true)
      })
    })

    describe('getAll', () => {
      it('should return all wallet accounts', async () => {
        const { walletAccounts } = await prepare()

        const walletAccountsNames = Object.keys(walletAccounts.getAll())

        expect(walletAccountsNames).toHaveLength(2)
        expect(walletAccountsNames[0]).toBe('exodus_0')
        expect(walletAccountsNames[1]).toBe('exodus_1')
      })
    })

    describe('getAccounts', () => {
      it('should return accounts', async () => {
        const { walletAccounts, channelOptions } = await prepare()

        const accounts = Object.fromEntries(
          Object.entries(stored).map(([key]) => [key, { bitcoin: 'some account data' }])
        )
        await channelOptions.processOne({
          data: {
            walletAccounts: stored,
            accounts,
          },
        })

        expect(walletAccounts.getAccounts()).toEqual(accounts)
      })

      it('should fall back to {} if no accounts exist', async () => {
        const { walletAccounts, channelOptions } = await prepare()

        await channelOptions.processOne({
          data: {
            walletAccounts: stored,
          },
        })

        expect(walletAccounts.getAccounts()).toEqual({})
      })
    })

    describe('setAccounts', () => {
      it('should set accounts', async () => {
        const { walletAccounts, hardwareWalletPublicKeysAtom } = await prepare()

        const expectedPublicKeys = {
          trezor_1_hp: {
            "m/84'/0'/0'": {
              xpub: 'xpub6DM5mUzGQ6GEnrmCm8aXRMJPWhJ7vGxo3q3gn7zSw4sbaLp6wZX7222AFhViNy6RPbpqWo5ZRosZEn9b2ehDZS2TqN6SaA7FoirRNSfWWjJ',
              chain: [0, 0, 0],
            },
          },
        }

        await walletAccounts.setAccounts(expectedPublicKeys)

        expect(walletAccounts.getAccounts()).toEqual(expectedPublicKeys)
        expect(await hardwareWalletPublicKeysAtom.get()).toEqual(expectedPublicKeys)
      })
    })

    describe('get', () => {
      it('should return a wallet account', async () => {
        const { walletAccounts } = await prepare()

        const walletAccount = walletAccounts.get('exodus_1')

        expect(walletAccount).toEqual(stored.exodus_1)
      })
    })

    describe('awaitSynced', () => {
      it('should await awaitProcessed', async () => {
        const { walletAccounts, awaitProcessed } = await prepare()
        const mockRejectValue = 'just making sure this is awaited'

        awaitProcessed.mockRejectedValueOnce(new Error(mockRejectValue))
        await expect(walletAccounts.awaitSynced()).rejects.toThrow(mockRejectValue)
      })
    })

    describe('getActive', () => {
      it('should get active wallet account', async () => {
        const { walletAccounts } = await prepare({ activeWalletAccount: 'exodus_1' })
        await expect(walletAccounts.getActive()).resolves.toBe('exodus_1')
      })
    })

    describe('setActive', () => {
      it('should set active wallet account', async () => {
        const { walletAccounts } = await prepare({ activeWalletAccount: 'exodus_1' })
        await walletAccounts.setActive('exodus_2')
        await expect(walletAccounts.getActive()).resolves.toBe('exodus_2')
      })
    })
  })

  describe('no-ops', () => {
    it('should not cause any emissions or writes', async () => {
      const { walletAccounts, pushToFusion, walletAccountsInternalAtom } = await prepare({
        walletAccounts: {
          ...stored,
          exodus_2: {
            ...stored.exodus_1,
            index: 2,
            enabled: false,
          },
        },
      })
      jest.spyOn(walletAccountsInternalAtom, 'set')
      await Promise.all([
        walletAccounts.update('exodus_0', { label: stored.exodus_0.label }),
        walletAccounts.disable('exodus_2'),
      ])

      expect(walletAccountsInternalAtom.set).not.toHaveBeenCalled()
      expect(pushToFusion).not.toHaveBeenCalled()
    })
  })

  describe('write operations in quick succession', () => {
    async function batchWrite() {
      const { walletAccounts, walletAccountsInternalAtom, ...rest } = await prepare()
      jest.spyOn(walletAccountsInternalAtom, 'set')
      await Promise.all([
        walletAccounts.update('exodus_0', {
          label: 'an update',
        }),
        walletAccounts.update('exodus_0', {
          label: 'another update',
        }),
        walletAccounts.update('exodus_0', {
          label: 'yet another one',
        }),
      ])
      return {
        ...rest,
        walletAccountsInternalAtom,
      }
    }

    it('should debounce fusion updates', async () => {
      const { pushToFusion } = await batchWrite()
      expect(pushToFusion).toHaveBeenCalledTimes(1)
      expect(pushToFusion).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            walletAccounts: {
              exodus_0: expect.objectContaining({
                label: 'yet another one',
              }),
              exodus_1: expect.anything(),
            },
          }),
        })
      )
    })

    it('should debounce atom writes', async () => {
      const { walletAccountsInternalAtom } = await batchWrite()
      expect(walletAccountsInternalAtom.set).toHaveBeenCalledTimes(1)
    })
  })

  it('grants allWalletAccountsEver access to channel', async () => {
    let channel
    const allWalletAccountsEver = {
      grantChannelAccess: (it) => {
        channel = it
      },
    }

    const { tail } = await prepare({
      allWalletAccountsEver,
    })

    const tailData = 'Batmobile blueprints'
    tail.mockResolvedValue(tailData)

    await expect(channel.tail()).resolves.toEqual(tailData)
  })

  it('should not block fixing compatibility or seedId mismatch', async () => {
    const seedId = primarySeedId
    const { channelOptions, walletAccountsAtom, walletAccounts } = await prepare({
      allowedSources: [EXODUS_SRC],
      walletAccounts: {
        exodus_0: { ...stored.exodus_0, seedId: undefined },
      },
      load: false,
    })

    const whenProcessed = channelOptions.processOne({
      data: {
        walletAccounts: {
          exodus_0: stored.exodus_0,
        },
      },
    })

    await walletAccounts.load({ seedId })

    await whenProcessed

    const all = await walletAccountsAtom.get()

    expect(all).toEqual({
      exodus_0: expect.objectContaining({ ...stored.exodus_0 }),
    })
  })
})
