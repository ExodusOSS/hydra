import { createAtomObserver } from '@exodus/atoms'
import { WalletAccount } from '@exodus/models'
import { SEED_SRC } from '@exodus/models/lib/wallet-account/index.js'

const createWalletAccountsPlugin = ({
  port,
  config,
  walletAccounts,
  activeWalletAccountAtom,
  hardwareWalletPublicKeysAtom,
  multipleWalletAccountsEnabledAtom,
  walletAccountsAtom,
  wallet,
}) => {
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
    const instance = walletAccounts.get(activeWalletAccount)

    if (!instance || !instance.enabled) {
      await activeWalletAccountAtom.set(WalletAccount.DEFAULT_NAME)
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
    await walletAccounts.load(seedParams)
    await ensureActiveAccountEnabled()
  }

  let seedParams

  const onUnlock = async () => {
    atomObservers.forEach((observer) => observer.start())
    await walletAccounts.load(seedParams)
    seedParams = undefined

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
    seedParams = params
  }

  const onImport = async (params) => {
    seedParams = params
  }

  return { onLoad, onUnlock, onClear, onStart, onStop, onAddSeed, onCreate, onImport }
}

export default createWalletAccountsPlugin
