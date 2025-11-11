import { createDeepEqualSelector } from '@exodus/core-selectors/utils/deep-equal.js'
// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'

const { memoize } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

const selectorFactory = (
  allEnabledWalletAccountsSelector,
  isCustodialWalletSelector,
  getIsReadOnlyWalletAccountSelector,
  isLedgerSelector
) =>
  memoize((operation) =>
    createDeepEqualSelector(
      allEnabledWalletAccountsSelector,
      isCustodialWalletSelector,
      getIsReadOnlyWalletAccountSelector,
      isLedgerSelector,
      (enabledWalletAccounts, isCustodial, isReadOnly, isLedger) => {
        let walletAccounts = enabledWalletAccounts.filter(
          (acc) => !isCustodial(acc) && !isLedger(acc)
        )
        if (operation === 'deposit') {
          walletAccounts = walletAccounts.filter((acc) => !isReadOnly(acc))
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
}

export default createLightningSelectorDefinition
