import { createInMemoryAtom } from '@exodus/atoms'
import { WalletAccount } from '@exodus/models'

import type { WalletAccountMap } from '../../types.js'
import createMultipleWalletAccountsPlugin from '../multiple-wallet-accounts-plugin.js'

const createDeferred = <T>() => {
  let resolveDeferred!: (value: T | PromiseLike<T>) => void
  const promise = new Promise<T>((resolve) => {
    resolveDeferred = resolve
  })

  return { promise, resolve: resolveDeferred }
}

const flushEventLoop = () => new Promise<void>((resolve) => setImmediate(resolve))

const waitForEvaluation = async () => {
  await flushEventLoop()
  await flushEventLoop()
}

const createWalletAccount = ({
  index,
  source = WalletAccount.EXODUS_SRC,
  enabled = true,
}: {
  index: number
  source?:
    | typeof WalletAccount.EXODUS_SRC
    | typeof WalletAccount.MPSWAPS_SRC
    | typeof WalletAccount.POLYMARKET_SRC
  enabled?: boolean
}) => new WalletAccount({ source, index, enabled })

describe('multiple wallet accounts plugin', () => {
  const createPlugin = ({
    walletAccounts,
    multipleWalletAccountsEnabled,
  }: {
    walletAccounts: WalletAccountMap
    multipleWalletAccountsEnabled?: boolean
  }) => {
    const walletAccountsAtom = createInMemoryAtom<WalletAccountMap>({
      defaultValue: walletAccounts,
    })
    const multipleWalletAccountsEnabledAtom = createInMemoryAtom<boolean | undefined>({
      defaultValue: multipleWalletAccountsEnabled,
    })
    const plugin = createMultipleWalletAccountsPlugin({
      walletAccountsAtom,
      multipleWalletAccountsEnabledAtom,
    })

    return { multipleWalletAccountsEnabledAtom, plugin, walletAccountsAtom }
  }

  it('ignores external accounts when auto-enabling multiple accounts', async () => {
    const defaultWalletAccount = createWalletAccount({ index: 0 })
    const { multipleWalletAccountsEnabledAtom, plugin, walletAccountsAtom } = createPlugin({
      walletAccounts: {
        exodus_0: defaultWalletAccount,
        polymarket_0: createWalletAccount({
          index: 0,
          source: WalletAccount.POLYMARKET_SRC,
        }),
      },
    })

    plugin.onUnlock()
    await waitForEvaluation()

    await expect(multipleWalletAccountsEnabledAtom.get()).resolves.toBeUndefined()

    await walletAccountsAtom.set({
      exodus_0: defaultWalletAccount,
      exodus_1: createWalletAccount({ index: 1 }),
      polymarket_0: createWalletAccount({
        index: 0,
        source: WalletAccount.POLYMARKET_SRC,
      }),
    })
    await waitForEvaluation()

    await expect(multipleWalletAccountsEnabledAtom.get()).resolves.toBe(true)
    plugin.onLock()
  })

  it('auto-enables multiple accounts for two enabled non-external accounts', async () => {
    const { multipleWalletAccountsEnabledAtom, plugin } = createPlugin({
      walletAccounts: {
        exodus_0: createWalletAccount({ index: 0 }),
        exodus_1: createWalletAccount({ index: 1 }),
      },
    })

    plugin.onUnlock()
    await waitForEvaluation()

    await expect(multipleWalletAccountsEnabledAtom.get()).resolves.toBe(true)
    plugin.onLock()
  })

  it('ignores disabled non-external accounts', async () => {
    const { multipleWalletAccountsEnabledAtom, plugin } = createPlugin({
      walletAccounts: {
        exodus_0: createWalletAccount({ index: 0 }),
        exodus_1: createWalletAccount({ index: 1, enabled: false }),
      },
    })

    plugin.onUnlock()
    await waitForEvaluation()

    await expect(multipleWalletAccountsEnabledAtom.get()).resolves.toBeUndefined()
    plugin.onLock()
  })

  it.each([true, false])('preserves an explicit preference of %s', async (preference) => {
    const { multipleWalletAccountsEnabledAtom, plugin, walletAccountsAtom } = createPlugin({
      multipleWalletAccountsEnabled: preference,
      walletAccounts: {
        exodus_0: createWalletAccount({ index: 0 }),
      },
    })

    plugin.onUnlock()
    await walletAccountsAtom.set({
      exodus_0: createWalletAccount({ index: 0 }),
      exodus_1: createWalletAccount({ index: 1 }),
    })
    await waitForEvaluation()

    await expect(multipleWalletAccountsEnabledAtom.get()).resolves.toBe(preference)
    plugin.onLock()
  })

  it('does not overwrite an explicit preference set during evaluation', async () => {
    const visibleWalletAccounts = {
      exodus_0: createWalletAccount({ index: 0 }),
      exodus_1: createWalletAccount({ index: 1 }),
    }
    const { multipleWalletAccountsEnabledAtom, plugin, walletAccountsAtom } = createPlugin({
      walletAccounts: visibleWalletAccounts,
    })
    const walletSnapshot = createDeferred<WalletAccountMap>()
    const walletGetStarted = createDeferred<void>()
    jest.spyOn(walletAccountsAtom, 'get').mockImplementationOnce(() => {
      walletGetStarted.resolve()
      return walletSnapshot.promise
    })
    const setPreference = jest.spyOn(multipleWalletAccountsEnabledAtom, 'set')

    plugin.onUnlock()
    await walletGetStarted.promise
    await multipleWalletAccountsEnabledAtom.set(false)
    walletSnapshot.resolve(visibleWalletAccounts)
    await waitForEvaluation()

    await expect(multipleWalletAccountsEnabledAtom.get()).resolves.toBe(false)
    expect(setPreference).not.toHaveBeenCalledWith(true)
    plugin.onLock()
  })

  it('does not overwrite an explicit preference set while committing', async () => {
    const visibleWalletAccounts = {
      exodus_0: createWalletAccount({ index: 0 }),
      exodus_1: createWalletAccount({ index: 1 }),
    }
    const { multipleWalletAccountsEnabledAtom, plugin } = createPlugin({
      walletAccounts: visibleWalletAccounts,
    })
    const autoSetStarted = createDeferred<void>()
    const commitAutoSet = createDeferred<void>()
    const originalSet = multipleWalletAccountsEnabledAtom.set.bind(
      multipleWalletAccountsEnabledAtom
    )
    jest.spyOn(multipleWalletAccountsEnabledAtom, 'set').mockImplementationOnce(async (update) => {
      autoSetStarted.resolve()
      await commitAutoSet.promise
      return originalSet(update)
    })

    plugin.onUnlock()
    await autoSetStarted.promise
    await originalSet(false)
    commitAutoSet.resolve()
    await waitForEvaluation()

    await expect(multipleWalletAccountsEnabledAtom.get()).resolves.toBe(false)
    plugin.onLock()
  })

  it('does not set the preference after locking during an evaluation', async () => {
    const visibleWalletAccounts = {
      exodus_0: createWalletAccount({ index: 0 }),
      exodus_1: createWalletAccount({ index: 1 }),
    }
    const { multipleWalletAccountsEnabledAtom, plugin, walletAccountsAtom } = createPlugin({
      walletAccounts: visibleWalletAccounts,
    })
    const walletSnapshot = createDeferred<WalletAccountMap>()
    const walletGetStarted = createDeferred<void>()
    jest.spyOn(walletAccountsAtom, 'get').mockImplementationOnce(() => {
      walletGetStarted.resolve()
      return walletSnapshot.promise
    })
    const setPreference = jest.spyOn(multipleWalletAccountsEnabledAtom, 'set')

    plugin.onUnlock()
    await walletGetStarted.promise
    plugin.onLock()
    walletSnapshot.resolve(visibleWalletAccounts)
    await waitForEvaluation()

    await expect(multipleWalletAccountsEnabledAtom.get()).resolves.toBeUndefined()
    expect(setPreference).not.toHaveBeenCalled()
  })

  it('does not set the preference after locking while committing', async () => {
    const visibleWalletAccounts = {
      exodus_0: createWalletAccount({ index: 0 }),
      exodus_1: createWalletAccount({ index: 1 }),
    }
    const { multipleWalletAccountsEnabledAtom, plugin } = createPlugin({
      walletAccounts: visibleWalletAccounts,
    })
    const autoSetStarted = createDeferred<void>()
    const commitAutoSet = createDeferred<void>()
    const originalSet = multipleWalletAccountsEnabledAtom.set.bind(
      multipleWalletAccountsEnabledAtom
    )
    jest.spyOn(multipleWalletAccountsEnabledAtom, 'set').mockImplementationOnce(async (update) => {
      autoSetStarted.resolve()
      await commitAutoSet.promise
      return originalSet(update)
    })

    plugin.onUnlock()
    await autoSetStarted.promise
    plugin.onLock()
    commitAutoSet.resolve()
    await waitForEvaluation()

    await expect(multipleWalletAccountsEnabledAtom.get()).resolves.toBeUndefined()
  })

  it('invalidates an in-flight evaluation when unlocked again', async () => {
    const defaultWalletAccount = createWalletAccount({ index: 0 })
    const { multipleWalletAccountsEnabledAtom, plugin, walletAccountsAtom } = createPlugin({
      walletAccounts: { exodus_0: defaultWalletAccount },
    })
    const staleWalletSnapshot = createDeferred<WalletAccountMap>()
    const walletGetStarted = createDeferred<void>()
    jest.spyOn(walletAccountsAtom, 'get').mockImplementationOnce(() => {
      walletGetStarted.resolve()
      return staleWalletSnapshot.promise
    })
    const setPreference = jest.spyOn(multipleWalletAccountsEnabledAtom, 'set')

    plugin.onUnlock()
    await walletGetStarted.promise
    plugin.onUnlock()
    staleWalletSnapshot.resolve({
      exodus_0: defaultWalletAccount,
      exodus_1: createWalletAccount({ index: 1 }),
    })
    await waitForEvaluation()

    await expect(multipleWalletAccountsEnabledAtom.get()).resolves.toBeUndefined()
    expect(setPreference).not.toHaveBeenCalled()

    await walletAccountsAtom.set({
      exodus_0: defaultWalletAccount,
      exodus_1: createWalletAccount({ index: 1 }),
    })
    await waitForEvaluation()

    await expect(multipleWalletAccountsEnabledAtom.get()).resolves.toBe(true)
    expect(setPreference).toHaveBeenCalledTimes(1)
    plugin.onLock()
  })
})
