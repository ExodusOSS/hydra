import type { Definition } from '@exodus/dependency-types'
import type { WalletAccounts } from '../module/wallet-accounts.js'
import type { EnabledWalletAccountsAtom, MultipleWalletAccountsEnabledAtom } from '../types.js'

const walletAccountsApi = ({
  walletAccounts,
  enabledWalletAccountsAtom,
  multipleWalletAccountsEnabledAtom,
}: Dependencies) => ({
  walletAccounts: {
    create: walletAccounts.create,
    update: walletAccounts.update,
    disable: walletAccounts.disable,
    disableMany: walletAccounts.disableMany,
    removeMany: walletAccounts.removeMany,
    enable: walletAccounts.enable,
    getEnabled: enabledWalletAccountsAtom.get,
    getActive: walletAccounts.getActive,
    setActive: walletAccounts.setActive,
    setMultipleEnabled: (value: boolean) => multipleWalletAccountsEnabledAtom.set(value),
  },
})

export type { WalletAccountsData, UpdateableData } from '../types.js'

type Dependencies = {
  walletAccounts: WalletAccounts
  enabledWalletAccountsAtom: EnabledWalletAccountsAtom
  multipleWalletAccountsEnabledAtom: MultipleWalletAccountsEnabledAtom
}

export default {
  id: 'walletAccountsApi',
  type: 'api',
  factory: walletAccountsApi,
  dependencies: [
    'walletAccounts',
    'enabledWalletAccountsAtom',
    'multipleWalletAccountsEnabledAtom',
  ],
} as const satisfies Definition
