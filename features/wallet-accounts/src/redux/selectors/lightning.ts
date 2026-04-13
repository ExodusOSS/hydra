import { createDeepEqualSelector } from '@exodus/core-selectors/utils/deep-equal.js'
// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import type { WalletAccountsSelectors } from '../types.js'

const { memoize } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

const selectorFactory = (
  allEnabledWalletAccountsSelector: WalletAccountsSelectors['enabled'],
  isCustodialWalletSelector: WalletAccountsSelectors['isCustodial'],
  getIsReadOnlyWalletAccountSelector: WalletAccountsSelectors['isReadOnly'],
  isLedgerSelector: WalletAccountsSelectors['isLedger']
) =>
  memoize((operation: string) =>
    createDeepEqualSelector(
      allEnabledWalletAccountsSelector,
      isCustodialWalletSelector,
      getIsReadOnlyWalletAccountSelector,
      isLedgerSelector,
      (
        enabledWalletAccounts: string[],
        isCustodial: (name: string) => boolean,
        isReadOnly: (name: string) => boolean,
        isLedger: (name: string) => boolean
      ) => {
        let walletAccounts = enabledWalletAccounts.filter(
          (acc: string) => !isCustodial(acc) && !isLedger(acc)
        )
        if (operation === 'deposit') {
          walletAccounts = walletAccounts.filter((acc: string) => !isReadOnly(acc))
        }

        return walletAccounts
      }
    )
  )

const createLightningSelectorDefinition = {
  id: 'createLightning',
  selectorFactory,
  dependencies: [
    //
    { selector: 'enabled' },
    { selector: 'isCustodial' },
    { selector: 'isReadOnly' },
    { selector: 'isLedger' },
  ],
} as const

export default createLightningSelectorDefinition
