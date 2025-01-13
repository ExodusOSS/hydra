import { WalletAccount } from '@exodus/models'
import delay from 'delay'
import { when } from 'jest-when'

const atomsActual = await import('@exodus/atoms')
jest.doMock('@exodus/atoms', () => ({
  __esModule: true,
  ...atomsActual,
  createAtomObserver: jest.fn(),
}))

const atoms = await import('@exodus/atoms')
const { default: createWalletAccountsPlugin } = await import('../lifecycle.js')

describe('walletAccounts lifecycle plugin', () => {
  let port
  let config
  let walletAccountsAtom
  let hardwareWalletPublicKeysAtom
  let multipleWalletAccountsEnabledAtom
  let activeWalletAccountAtom
  let walletAccounts
  let plugin
  let walletAccountsAtomObserver
  let hardwareWalletPublicKeysAtomObserver
  let activeWalletAccountAtomObserver
  let multipleWalletAccountsEnabledAtomObserver
  let wallet

  const createAtomObserverMock = () => ({
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
    }

    wallet = {
      getExtraSeedIds: () => ['testId'],
    }

    plugin = createWalletAccountsPlugin({
      port,
      config,
      walletAccounts,
      hardwareWalletPublicKeysAtom,
      activeWalletAccountAtom,
      multipleWalletAccountsEnabledAtom,
      walletAccountsAtom,
      wallet,
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

  test('should start observing atoms when loaded', () => {
    plugin.onLoad({ isLocked: false })

    expect(walletAccountsAtomObserver.start).toHaveBeenCalled()
    expect(hardwareWalletPublicKeysAtomObserver.start).toHaveBeenCalled()
    expect(activeWalletAccountAtomObserver.start).toHaveBeenCalled()
    expect(multipleWalletAccountsEnabledAtomObserver.start).toHaveBeenCalled()
  })

  test('should load wallet accounts on load if wallet unlocked', async () => {
    await plugin.onLoad({ isLocked: false })

    expect(walletAccounts.load).toHaveBeenCalledTimes(1)
  })

  test('should not load wallet accounts on load if wallet locked', async () => {
    await plugin.onLoad({ isLocked: true })

    expect(walletAccounts.load).toHaveBeenCalledTimes(0)
  })

  test('should load wallet accounts on unlock if wallet unlocked', async () => {
    await plugin.onUnlock()

    expect(walletAccounts.load).toHaveBeenCalledTimes(1)
  })

  test('should start observing atoms if wallet unlocked', () => {
    plugin.onUnlock()

    expect(walletAccountsAtomObserver.start).toHaveBeenCalled()
    expect(hardwareWalletPublicKeysAtomObserver.start).toHaveBeenCalled()
    expect(activeWalletAccountAtomObserver.start).toHaveBeenCalled()
    expect(multipleWalletAccountsEnabledAtomObserver.start).toHaveBeenCalled()
  })

  test('should reset active wallet account if current one is disabled', async () => {
    await activeWalletAccountAtom.set('exodus_1')

    when(walletAccounts.get).calledWith('exodus_1').mockReturnValue({ enabled: false })

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

    expect(walletAccounts.update).not.toHaveBeenCalled()

    await plugin.onUnlock()

    expect(walletAccounts.load).toHaveBeenCalledWith({
      seedId: '42',
      compatibilityMode: 'wayne',
    })
  })

  test('updates seedId after create in onUnlock', async () => {
    await plugin.onCreate({ seedId: '42' })

    expect(walletAccounts.update).not.toHaveBeenCalled()

    await plugin.onUnlock()

    expect(walletAccounts.load).toHaveBeenCalledWith({
      seedId: '42',
    })
  })

  test('does not update seedId if already present', async () => {
    await plugin.onImport({ seedId: '42' })

    expect(walletAccounts.update).not.toHaveBeenCalled()
    walletAccounts.get.mockReturnValue(
      new WalletAccount({ ...WalletAccount.DEFAULT, seedId: 'abc' })
    )

    await plugin.onUnlock()

    expect(walletAccounts.update).not.toHaveBeenCalled()
  })

  test('does update compatibilityMode even if seedId already present', async () => {
    await plugin.onImport({ seedId: '42', compatibilityMode: 'wayne' })

    expect(walletAccounts.update).not.toHaveBeenCalled()
    walletAccounts.get.mockReturnValue(
      new WalletAccount({ ...WalletAccount.DEFAULT, seedId: '42' })
    )

    await plugin.onUnlock()

    expect(walletAccounts.load).toHaveBeenCalledWith({
      seedId: '42',
      compatibilityMode: 'wayne',
    })
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
      getExtraSeedIds: () => [],
    }

    plugin = createWalletAccountsPlugin({
      port,
      config,
      walletAccounts,
      hardwareWalletPublicKeysAtom,
      activeWalletAccountAtom,
      multipleWalletAccountsEnabledAtom,
      walletAccountsAtom,
      wallet,
    })

    await plugin.onUnlock()

    await delay(0) // wait for side-effect to run in unlock

    expect(walletAccounts.createMany).not.toHaveBeenCalled()
  })

  test("doesn't add wallet accounts for extra seeds that have them", async () => {
    wallet = {
      getExtraSeedIds: () => ['testId', 'testId2'],
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
      walletAccounts,
      hardwareWalletPublicKeysAtom,
      activeWalletAccountAtom,
      multipleWalletAccountsEnabledAtom,
      walletAccountsAtom,
      wallet,
    })

    await plugin.onUnlock()
    await delay(0)

    expect(walletAccounts.createMany).toHaveBeenCalledWith([
      { index: 0, label: 'configDefinedLabel', seedId: 'testId2', source: WalletAccount.SEED_SRC },
    ])
  })
})
