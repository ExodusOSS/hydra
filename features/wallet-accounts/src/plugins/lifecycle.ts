import type { Atom } from '@exodus/atoms'
import { createAtomObserver } from '@exodus/atoms'
import { WalletAccount } from '@exodus/models'
import { safeString } from '@exodus/safe-string'

import type { WalletAccounts } from '../module/wallet-accounts.js'
import type {
  WalletAccountsAtom,
  MultipleWalletAccountsEnabledAtom,
  Port,
  ErrorTracking,
} from '../types.js'

const createWalletAccountsPlugin = ({
  port,
  config,
  walletAccounts,
  activeWalletAccountAtom,
  hardwareWalletPublicKeysAtom,
  multipleWalletAccountsEnabledAtom,
  walletAccountsAtom,
  errorTracking,
}: Dependencies) => {
  let createAccountParams: CreateAccountParams | null = null

  const createAccount = async (params: CreateAccountParams) => {
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
    const instance = activeWalletAccount ? loadedWalletAccounts[activeWalletAccount] : undefined

    if (!instance || !instance.enabled) {
      const firstAccount = Object.keys(loadedWalletAccounts)[0]
      if (firstAccount) await activeWalletAccountAtom.set(firstAccount)
    }
  }

  const onLoad = async ({ isLocked }: { isLocked: boolean }) => {
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

  const onCreate = async (params: CreateAccountParams) => {
    createAccountParams = params
  }

  const onImport = async (params: CreateAccountParams) => {
    createAccountParams = params
  }

  return { onLoad, onUnlock, onClear, onStart, onStop, onCreate, onImport }
}

type Dependencies = {
  port: Port
  config: { defaultLabel: string; defaultColor?: string }
  walletAccounts: WalletAccounts
  activeWalletAccountAtom: Atom<string | undefined>
  hardwareWalletPublicKeysAtom: Atom<Record<string, unknown>>
  multipleWalletAccountsEnabledAtom: MultipleWalletAccountsEnabledAtom
  walletAccountsAtom: WalletAccountsAtom
  errorTracking: ErrorTracking
}

type CreateAccountParams = { source?: string; seedId?: string; compatibilityMode?: string }

export default createWalletAccountsPlugin
