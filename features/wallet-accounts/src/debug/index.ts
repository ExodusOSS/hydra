import type { Definition } from '@exodus/dependency-types'

import { WalletAccount } from '@exodus/models'
import type { WalletAccountsAtom, AllWalletAccountsEver } from '../types.js'

const createWalletAccountsDebug = ({
  walletAccounts,
  walletAccountsAtom,
  allWalletAccountsEver,
}: Dependencies) => {
  const enableAll = async () => {
    const instances = await walletAccountsAtom.get()
    const toEnable = Object.keys(instances)
    await walletAccounts.enableMany(toEnable)
  }

  const disableAll = async () => {
    const instances = await walletAccountsAtom.get()
    const toDisable = Object.keys(instances).filter((it) => it !== WalletAccount.DEFAULT_NAME)
    await walletAccounts.disableMany(toDisable)
  }

  return {
    walletAccounts: {
      enableAll,
      disableAll,
      getAllWalletAccountsEver: allWalletAccountsEver.get,
    },
  }
}

const walletAccountsDebugDefinition = {
  id: 'walletAccountsDebug',
  type: 'debug',
  factory: createWalletAccountsDebug,
  dependencies: ['walletAccounts', 'walletAccountsAtom', 'allWalletAccountsEver'],
  public: true,
} as const satisfies Definition

type Dependencies = {
  walletAccounts: WalletAccountsModule
  walletAccountsAtom: WalletAccountsAtom
  allWalletAccountsEver: AllWalletAccountsEver
}

export interface WalletAccountsModule {
  enableMany(names: string[]): Promise<void>
  disableMany(names: string[]): Promise<void>
}

export default walletAccountsDebugDefinition
