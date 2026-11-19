import walletRpc from '../index.js'

const buildFeature = ({ hasPassphraseSet = true } = {}) => {
  const api = {
    unlock: jest.fn(async () => ({ primarySeedId: 'seed-1' })),
    create: jest.fn(async () => ({ seedId: 'seed-1' })),
    import: jest.fn(async () => ({ seedId: 'seed-2' })),
    clear: jest.fn(async () => {}),
    changePassphrase: jest.fn(async () => {}),
    exists: jest.fn(async () => true),
    hasPassphraseSet: jest.fn(async () => hasPassphraseSet),
  }

  const { definitions } = walletRpc(api)
  const getDefinition = (id) => definitions.find((entry) => entry.definition.id === id).definition

  const atoms = {
    primarySeedIdAtom: getDefinition('primarySeedIdAtom').factory(),
    walletExistsAtom: getDefinition('walletExistsAtom').factory(),
    hasPassphraseSetAtom: getDefinition('hasPassphraseSetAtom').factory(),
  }
  const errorTracking = { track: jest.fn(async () => {}) }
  const logger = { error: jest.fn(), warn: jest.fn() }

  const wallet = getDefinition('wallet').factory({ ...atoms, errorTracking, logger })
  const walletApi = getDefinition('walletApi').factory({ wallet }).wallet
  const plugin = getDefinition('walletLifecyclePlugin').factory({ ...atoms, wallet })

  return { api, errorTracking, logger, wallet, walletApi, plugin, ...atoms }
}

describe('wallet-rpc seed-ingesting proxy', () => {
  it('ingests primarySeedId on unlock and unwraps the result', async () => {
    const { wallet, primarySeedIdAtom } = buildFeature()
    await expect(wallet.unlock({ passphrase: 'pw' })).resolves.toBe('seed-1')
    await expect(primarySeedIdAtom.get()).resolves.toBe('seed-1')
  })

  it('marks walletExists and mirrors hasPassphraseSet on create', async () => {
    const { walletApi, walletExistsAtom, hasPassphraseSetAtom } = buildFeature({
      hasPassphraseSet: false,
    })
    await expect(walletApi.create({ passphrase: 'pw' })).resolves.toEqual({ seedId: 'seed-1' })
    await expect(walletExistsAtom.get()).resolves.toBe(true)
    await expect(hasPassphraseSetAtom.get()).resolves.toBe(false)
  })

  it('marks walletExists and mirrors hasPassphraseSet on import', async () => {
    const { wallet, walletExistsAtom, hasPassphraseSetAtom } = buildFeature({
      hasPassphraseSet: true,
    })
    await expect(wallet.import({ mnemonic: 'x' })).resolves.toEqual({ seedId: 'seed-2' })
    await expect(walletExistsAtom.get()).resolves.toBe(true)
    await expect(hasPassphraseSetAtom.get()).resolves.toBe(true)
  })

  it('resets both atoms on clear', async () => {
    const { wallet, walletExistsAtom, hasPassphraseSetAtom } = buildFeature()
    await wallet.create({ passphrase: 'pw' })
    await wallet.clear()
    await expect(walletExistsAtom.get()).resolves.toBe(false)
    await expect(hasPassphraseSetAtom.get()).resolves.toBe(false)
  })

  it('preserves a successful clear when local state synchronization fails', async () => {
    const { api, errorTracking, logger, wallet, walletExistsAtom, hasPassphraseSetAtom } =
      buildFeature()
    const synchronizationError = new Error('atom observer failed')
    await Promise.all([walletExistsAtom.set(true), hasPassphraseSetAtom.set(true)])
    walletExistsAtom.set = jest.fn().mockRejectedValueOnce(synchronizationError)

    await expect(wallet.clear()).resolves.toBeUndefined()

    expect(api.clear).toHaveBeenCalled()
    await expect(hasPassphraseSetAtom.get()).resolves.toBe(false)
    expect(logger.warn).toHaveBeenCalledWith(
      'failed to synchronize wallet state after clear',
      synchronizationError
    )
    expect(errorTracking.track).toHaveBeenCalledWith({
      error: synchronizationError,
      namespace: 'wallet-rpc',
    })
    expect(synchronizationError.hint).toBeDefined()
  })

  it('mirrors hasPassphraseSet on changePassphrase', async () => {
    const { api, wallet, hasPassphraseSetAtom } = buildFeature({ hasPassphraseSet: false })
    api.hasPassphraseSet.mockResolvedValue(true)
    await wallet.changePassphrase({ currentPassphrase: 'a', newPassphrase: 'b' })
    await expect(hasPassphraseSetAtom.get()).resolves.toBe(true)
  })

  it.each([
    ['create', { passphrase: 'pw' }, { seedId: 'seed-1' }],
    ['import', { mnemonic: 'x' }, { seedId: 'seed-2' }],
    ['changePassphrase', { currentPassphrase: 'old', newPassphrase: 'new' }, undefined],
  ])(
    'preserves a successful %s result when post-commit synchronization fails',
    async (method, args, expected) => {
      const { api, errorTracking, logger, wallet, walletExistsAtom, hasPassphraseSetAtom } =
        buildFeature()
      const transportError = new Error('wallet process disconnected')
      await hasPassphraseSetAtom.set(false)
      api.hasPassphraseSet.mockRejectedValueOnce(transportError)

      await expect(wallet[method](args)).resolves.toEqual(expected)

      if (method !== 'changePassphrase') {
        await expect(walletExistsAtom.get()).resolves.toBe(true)
      }

      await expect(hasPassphraseSetAtom.get()).resolves.toBe(false)
      expect(logger.warn).toHaveBeenCalledWith(
        `failed to synchronize wallet state after ${method}`,
        transportError
      )
      expect(errorTracking.track).toHaveBeenCalledWith({
        error: transportError,
        namespace: 'wallet-rpc',
      })
      expect(transportError.hint).toBeDefined()
    }
  )

  it.each([
    ['create', { passphrase: 'pw' }],
    ['import', { mnemonic: 'x' }],
    ['changePassphrase', { currentPassphrase: 'old', newPassphrase: 'new' }],
  ])('still rejects when the remote %s mutation fails', async (method, args) => {
    const { api, errorTracking, wallet } = buildFeature()
    const mutationError = new Error('remote mutation failed')
    api[method].mockRejectedValueOnce(mutationError)

    await expect(wallet[method](args)).rejects.toBe(mutationError)
    expect(api.hasPassphraseSet).not.toHaveBeenCalled()
    expect(errorTracking.track).not.toHaveBeenCalled()
  })

  it('seeds atoms from the wallet module on start', async () => {
    const { api, plugin, walletExistsAtom, hasPassphraseSetAtom } = buildFeature({
      hasPassphraseSet: false,
    })
    await plugin.onStart()
    expect(api.exists).toHaveBeenCalled()
    expect(api.hasPassphraseSet).toHaveBeenCalled()
    await expect(walletExistsAtom.get()).resolves.toBe(true)
    await expect(hasPassphraseSetAtom.get()).resolves.toBe(false)
  })
})
