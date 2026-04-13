import type { Atom } from '@exodus/atoms'
import { WalletAccount } from '@exodus/models'
import delay from 'delay'
import { when } from 'jest-when'

import type { WalletAccounts } from '../../module/wallet-accounts.js'
import type { HardwareWalletPublicKeys, WalletAccountMap } from '../../types.js'

const actualAtoms = await import('@exodus/atoms')

jest.doMock('@exodus/atoms', () => ({
  __esModule: true,
  ...actualAtoms,
  createAtomObserver: jest.fn(),
}))

const atoms = await import('@exodus/atoms')
const { default: createWalletAccountsPlugin } = await import('../lifecycle.js')

type AtomObserverMock = {
  register: jest.Mock
  unregister: jest.Mock
  start: jest.Mock
}

describe('walletAccounts lifecycle plugin', () => {
  let port: { emit: jest.Mock }
  let config: { defaultLabel: string; defaultColor?: string }
  let walletAccountsAtom: Atom<WalletAccountMap>
  let hardwareWalletPublicKeysAtom: Atom<HardwareWalletPublicKeys>
  let multipleWalletAccountsEnabledAtom: Atom<boolean | undefined>
  let activeWalletAccountAtom: Atom<string | undefined>
  let walletAccounts: {
    load: jest.Mock
    get: jest.Mock
    clear: jest.Mock
    update: jest.Mock
    create: jest.Mock
    createMany: jest.Mock
    getAll: jest.Mock
  }
  let errorTracking: { track: jest.Mock }
  let plugin: ReturnType<typeof createWalletAccountsPlugin>
  let walletAccountsAtomObserver: AtomObserverMock
  let hardwareWalletPublicKeysAtomObserver: AtomObserverMock
  let activeWalletAccountAtomObserver: AtomObserverMock
  let multipleWalletAccountsEnabledAtomObserver: AtomObserverMock
  let wallet: { getExtraSeedIds: () => Promise<string[]>; getPrimarySeedId: () => Promise<string> }

  const createAtomObserverMock = (): AtomObserverMock => ({
    register: jest.fn(),
    unregister: jest.fn(),
    start: jest.fn(),
  })

  beforeEach(() => {
    walletAccountsAtomObserver = createAtomObserverMock()
    when(atoms.createAtomObserver)
      .calledWith(expect.objectContaining({ event: 'walletAccounts' }))
      .mockReturnValue(walletAccountsAtomObserver)

    activeWalletAccountAtomObserver = createAtomObserverMock()
    when(atoms.createAtomObserver)
      .calledWith(expect.objectContaining({ event: 'activeWalletAccount' }))
      .mockReturnValue(activeWalletAccountAtomObserver)

    hardwareWalletPublicKeysAtomObserver = createAtomObserverMock()
    when(atoms.createAtomObserver)
      .calledWith(expect.objectContaining({ event: 'hardwareWalletPublicKeys' }))
      .mockReturnValue(hardwareWalletPublicKeysAtomObserver)

    multipleWalletAccountsEnabledAtomObserver = createAtomObserverMock()
    when(atoms.createAtomObserver)
      .calledWith(expect.objectContaining({ event: 'multipleWalletAccountsEnabled' }))
      .mockReturnValue(multipleWalletAccountsEnabledAtomObserver)

    port = { emit: jest.fn() }
    config = { defaultLabel: 'configDefinedLabel' }
    walletAccountsAtom = atoms.createInMemoryAtom({
      defaultValue: { exodus_0: WalletAccount.DEFAULT },
    })
    hardwareWalletPublicKeysAtom = atoms.createInMemoryAtom({
      defaultValue: {},
    })
    activeWalletAccountAtom = atoms.createAtomMock({ defaultValue: 'exodus_0' })
    multipleWalletAccountsEnabledAtom = atoms.createAtomMock({ defaultValue: false })

    walletAccounts = {
      load: jest.fn(),
      get: jest.fn(() => WalletAccount.DEFAULT),
      clear: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      getAll: jest.fn(),
    }

    errorTracking = { track: jest.fn() }

    wallet = {
      getExtraSeedIds: () => Promise.resolve(['testId']),
      getPrimarySeedId: () => Promise.resolve('primarySeedId'),
    }

    plugin = createWalletAccountsPlugin({
      port,
      config,
      walletAccounts: walletAccounts as unknown as WalletAccounts,
      hardwareWalletPublicKeysAtom,
      activeWalletAccountAtom,
      multipleWalletAccountsEnabledAtom,
      walletAccountsAtom,
      wallet,
      errorTracking,
    })
  })

  test('should create atom observers and register them but not start yet', () => {
    expect(atoms.createAtomObserver).toHaveBeenCalledWith({
      port,
      atom: walletAccountsAtom,
      event: 'walletAccounts',
      immediateRegister: false,
    })
    expect(atoms.createAtomObserver).toHaveBeenCalledWith({
      port,
      atom: hardwareWalletPublicKeysAtom,
      event: 'hardwareWalletPublicKeys',
      immediateRegister: false,
    })
    expect(atoms.createAtomObserver).toHaveBeenCalledWith({
      port,
      atom: activeWalletAccountAtom,
      event: 'activeWalletAccount',
      immediateRegister: false,
    })
    expect(atoms.createAtomObserver).toHaveBeenCalledWith({
      port,
      atom: multipleWalletAccountsEnabledAtom,
      event: 'multipleWalletAccountsEnabled',
      immediateRegister: false,
    })

    expect(walletAccountsAtomObserver.start).not.toHaveBeenCalled()
    expect(hardwareWalletPublicKeysAtomObserver.start).not.toHaveBeenCalled()
    expect(activeWalletAccountAtomObserver.start).not.toHaveBeenCalled()
    expect(multipleWalletAccountsEnabledAtomObserver.start).not.toHaveBeenCalled()
  })

  test('should start observing atoms when loaded', async () => {
    await plugin.onLoad({ isLocked: false })

    expect(walletAccountsAtomObserver.start).toHaveBeenCalled()
    expect(hardwareWalletPublicKeysAtomObserver.start).toHaveBeenCalled()
    expect(activeWalletAccountAtomObserver.start).toHaveBeenCalled()
    expect(multipleWalletAccountsEnabledAtomObserver.start).toHaveBeenCalled()
  })

  test('should not load wallet accounts on load if wallet locked', async () => {
    await plugin.onLoad({ isLocked: true })

    expect(walletAccounts.load).toHaveBeenCalledTimes(0)
  })

  test('should load wallet accounts on unlock if wallet unlocked', async () => {
    await plugin.onUnlock()

    expect(walletAccounts.load).toHaveBeenCalledTimes(1)
  })

  test('should start observing atoms if wallet unlocked', async () => {
    await plugin.onUnlock()

    expect(walletAccountsAtomObserver.start).toHaveBeenCalled()
    expect(hardwareWalletPublicKeysAtomObserver.start).toHaveBeenCalled()
    expect(activeWalletAccountAtomObserver.start).toHaveBeenCalled()
    expect(multipleWalletAccountsEnabledAtomObserver.start).toHaveBeenCalled()
  })

  test('should reset active wallet account if current one is disabled', async () => {
    await activeWalletAccountAtom.set('exodus_1')

    when(walletAccounts.get!).calledWith('exodus_1').mockResolvedValue({ enabled: false })
    when(walletAccounts.getAll!).mockResolvedValue({
      exodus_0: new WalletAccount({ ...WalletAccount.DEFAULT, seedId: 'abc' }),
    })

    await plugin.onUnlock()

    await expect(activeWalletAccountAtom.get()).resolves.toBe('exodus_0')
  })

  test('should clear wallet accounts', async () => {
    await plugin.onClear()

    expect(walletAccounts.clear).toHaveBeenCalledTimes(1)
  })

  test('should clear active wallet account', async () => {
    await activeWalletAccountAtom.set('exodus_1')

    await plugin.onClear()

    await expect(activeWalletAccountAtom.get()).resolves.toBe('exodus_0')
  })

  test('should unobserve atoms when stopped', () => {
    plugin.onStop()

    expect(walletAccountsAtomObserver.unregister).toHaveBeenCalled()
    expect(hardwareWalletPublicKeysAtomObserver.unregister).toHaveBeenCalled()
    expect(activeWalletAccountAtomObserver.unregister).toHaveBeenCalled()
    expect(multipleWalletAccountsEnabledAtomObserver.unregister).toHaveBeenCalled()
  })

  test('updates seedId and compatibilityMode after import in onUnlock', async () => {
    await plugin.onImport({ seedId: '42', compatibilityMode: 'wayne' })
    await plugin.onUnlock()

    expect(walletAccounts.createMany).toHaveBeenCalledWith(
      [
        {
          color: undefined,
          compatibilityMode: 'wayne',
          label: 'configDefinedLabel',
          seedId: '42',
          source: 'exodus',
        },
      ],
      { useOptimisticWrite: true }
    )

    await plugin.onUnlock()
  })

  test('updates seedId after create in onUnlock', async () => {
    await plugin.onCreate({ seedId: '42' })
    await plugin.onUnlock()
    expect(walletAccounts.createMany).toHaveBeenCalledWith(
      [
        {
          color: undefined,
          compatibilityMode: undefined,
          label: 'configDefinedLabel',
          seedId: '42',
          source: 'exodus',
        },
      ],
      { useOptimisticWrite: true }
    )

    await plugin.onUnlock()
  })

  test('does not update seedId if already present', async () => {
    await plugin.onImport({ seedId: '42' })

    expect(walletAccounts.update).not.toHaveBeenCalled()
    walletAccounts.get!.mockResolvedValue(
      new WalletAccount({ ...WalletAccount.DEFAULT, seedId: 'abc' })
    )

    await plugin.onUnlock()

    expect(walletAccounts.update).not.toHaveBeenCalled()
  })

  test('adds the default wallet account when a new seed is added', async () => {
    const data = { seedId: 'seedId', compatibilityMode: 'mode' }
    await plugin.onAddSeed(data)

    expect(walletAccounts.create).toHaveBeenCalledWith({
      ...data,
      label: 'configDefinedLabel',
      source: WalletAccount.SEED_SRC,
      index: 0,
    })
  })

  test('adds wallet accounts for seed ids without them', async () => {
    await plugin.onUnlock()

    await delay(0) // wait for side-effect to run in unlock

    expect(walletAccounts.createMany).toHaveBeenCalledWith([
      { index: 0, label: 'configDefinedLabel', seedId: 'testId', source: WalletAccount.SEED_SRC },
    ])
  })

  test("doesn't add extra wallet accounts for primary seed", async () => {
    wallet = {
      getExtraSeedIds: () => Promise.resolve([]),
      getPrimarySeedId: () => Promise.resolve('primarySeedId'),
    }

    plugin = createWalletAccountsPlugin({
      port,
      config,
      walletAccounts: walletAccounts as unknown as WalletAccounts,
      hardwareWalletPublicKeysAtom,
      activeWalletAccountAtom,
      multipleWalletAccountsEnabledAtom,
      walletAccountsAtom,
      wallet,
      errorTracking,
    })

    await plugin.onUnlock()

    await delay(0) // wait for side-effect to run in unlock

    expect(walletAccounts.createMany).not.toHaveBeenCalled()
  })

  test("doesn't add wallet accounts for extra seeds that have them", async () => {
    wallet = {
      getExtraSeedIds: () => Promise.resolve(['testId', 'testId2']),
      getPrimarySeedId: () => Promise.resolve('primarySeedId'),
    }
    walletAccountsAtom = atoms.createInMemoryAtom({
      defaultValue: {
        exodus_0: WalletAccount.DEFAULT,
        testId_0: new WalletAccount({
          index: 0,
          label: 'configDefinedLabel',
          seedId: 'testId',
          source: WalletAccount.SEED_SRC,
        }),
      },
    })

    plugin = createWalletAccountsPlugin({
      port,
      config,
      walletAccounts: walletAccounts as unknown as WalletAccounts,
      hardwareWalletPublicKeysAtom,
      activeWalletAccountAtom,
      multipleWalletAccountsEnabledAtom,
      walletAccountsAtom,
      wallet,
      errorTracking,
    })

    await plugin.onUnlock()
    await delay(0)

    expect(walletAccounts.createMany).toHaveBeenCalledWith([
      { index: 0, label: 'configDefinedLabel', seedId: 'testId2', source: WalletAccount.SEED_SRC },
    ])
  })
})
