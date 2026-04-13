import type { WalletAccount } from '@exodus/models'
import { createSelector } from 'reselect'
import type { WalletAccountsSelectors } from '../types.js'

const getExportPathNameSelectorFactory = (
  getWalletAccountSelector: WalletAccountsSelectors['get'],
  getPathFriendlyNameSelector: WalletAccountsSelectors['getPathFriendlyName']
) =>
  createSelector(
    getWalletAccountSelector,
    getPathFriendlyNameSelector,
    (
      getWalletAccount: (name: string) => WalletAccount | undefined,
      getWalletAccountPathFriendlyName: (name: string) => string
    ) =>
      (walletAccount: string) => {
        const { isHardware } = getWalletAccount(walletAccount) ?? {}
        return isHardware ? getWalletAccountPathFriendlyName(walletAccount) : walletAccount
      }
  )

const getExportPathNameSelectorDefinition = {
  id: 'getExportPathName',
  selectorFactory: getExportPathNameSelectorFactory,
  dependencies: [
    //
    { selector: 'get' },
    { selector: 'getPathFriendlyName' },
  ],
} as const

export default getExportPathNameSelectorDefinition
