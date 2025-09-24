import { createAtomObserver } from '@exodus/atoms'
import { SEED_SRC } from '@exodus/models/lib/wallet-account/index.js'
import { WalletAccount } from '@exodus/models'
import { safeString } from '@exodus/safe-string'

const createWalletAccountsPlugin = ({
  port,
  config,
  walletAccounts,
  activeWalletAccountAtom,
  hardwareWalletPublicKeysAtom,
  multipleWalletAccountsEnabledAtom,
  walletAccountsAtom,
  wallet,
  errorTracking,
}) => {
  let createAccountParams

  const createAccount = async (params) => {
    try {
      const { source, seedId, compatibilityMode } = params
      await walletAccounts.createMany(
        [
          {
            source: source || WalletAccount.EXODUS_SRC,
            label: config.defaultLabel,
            color: config.defaultColor,
            seedId,
            compatibilityMode,
          },
        ],
        { useOptimisticWrite: true }
      )
    } catch (error) {
      errorTracking.track({ error, namespace: safeString`wallet-accounts-lifecycle` })
      throw error
    }
  }

  const atomObservers = [
    createAtomObserver({
      port,
      atom: activeWalletAccountAtom,
      event: 'activeWalletAccount',
      immediateRegister: false,
    }),
    createAtomObserver({
      port,
      atom: hardwareWalletPublicKeysAtom,
      event: 'hardwareWalletPublicKeys',
      immediateRegister: false,
    }),
    createAtomObserver({
      port,
      atom: multipleWalletAccountsEnabledAtom,
      event: 'multipleWalletAccountsEnabled',
      immediateRegister: false,
    }),
    createAtomObserver({
      port,
      atom: walletAccountsAtom,
      event: 'walletAccounts',
      immediateRegister: false,
    }),
  ]

  const ensureActiveAccountEnabled = async () => {
    const activeWalletAccount = await activeWalletAccountAtom.get()
    const loadedWalletAccounts = await walletAccountsAtom.get()
    const instance = loadedWalletAccounts[activeWalletAccount]

    if (!instance || !instance.enabled) {
      await activeWalletAccountAtom.set(Object.keys(loadedWalletAccounts)[0])
    }
  }

  const ensureEachSeedHasAccount = async () => {
    const extraSeedIdsWithoutAccounts = new Set(await wallet.getExtraSeedIds())

    const accounts = Object.values(await walletAccountsAtom.get())
    accounts.forEach(({ seedId, enabled }) => {
      if (enabled) extraSeedIdsWithoutAccounts.delete(seedId)
    })

    const newAccounts = [...extraSeedIdsWithoutAccounts].map((seedId) => ({
      label: config.defaultLabel,
      source: SEED_SRC,
      seedId,
      index: 0,
    }))

    if (newAccounts.length > 0) await walletAccounts.createMany(newAccounts)
  }

  const onLoad = async ({ isLocked }) => {
    if (isLocked) return

    atomObservers.forEach((observer) => observer.start())
  }

  const onUnlock = async () => {
    atomObservers.forEach((observer) => observer.start())
    if (createAccountParams) {
      await createAccount(createAccountParams)
      createAccountParams = null
    }

    await walletAccounts.load()

    await ensureActiveAccountEnabled()
    ensureEachSeedHasAccount()
  }

  const onClear = async () => {
    await Promise.all([walletAccounts.clear(), activeWalletAccountAtom.set(undefined)])
  }

  const onStart = () => {
    atomObservers.forEach((observer) => observer.register())
  }

  const onStop = () => {
    atomObservers.forEach((observer) => observer.unregister())
  }

  const onAddSeed = async ({ seedId, compatibilityMode }) => {
    await walletAccounts.create({
      label: config.defaultLabel,
      source: SEED_SRC,
      seedId,
      compatibilityMode,
      index: 0,
    })
  }

  const onCreate = async (params) => {
    createAccountParams = params
  }

  const onImport = async (params) => {
    createAccountParams = params
  }

  return { onLoad, onUnlock, onClear, onStart, onStop, onAddSeed, onCreate, onImport }
}

export default createWalletAccountsPlugin
