import getWalletAccountSelector from './get.js'
import activeWalletAccountSelector from './active.js'
import activeWalletAccountIsCustodialSelector from './active-is-custodial.js'
import activeWalletAccountNonCustodialSelector from './active-non-custodial.js'
import isCustodialWalletAccountSelector from './is-custodial.js'
import getMemoizedWalletAccountSelectorFactory from './get-memoized.js'
import allWalletAccountNamesSelector from './names.js'
import allWalletAccountsSelector from './all.js'
import enabledWalletAccountsSelector from './enabled.js'
import filterWalletAccountsSelector from './filter.js'
import hasMaxAmountOfAccountsSelector from './has-max-amount-of-accounts.js'
import hasMaxAmountOfLedgerAccountsSelector from './has-max-amount-of-ledger-accounts.js'
import hasMaxAmountOfTrezorAccountsSelector from './has-max-amount-of-trezor-accounts.js'
import findSelector from './find.js'
import allNonCustodialSelector from './all-non-custodial.js'
import getProperNameSelector from './get-proper-name.js'
import createProperNameSelector from './get-proper-name-memoized.js'
import getPathFriendlyNameSelector from './get-path-friendly-name.js'
import getExportPathNameSelector from './get-export-path-name.js'
import isFTXSelector from './is-ftx.js'
import isReadOnlySelector from './is-read-only.js'
import isLedgerSelector from './is-ledger.js'
import isLedgerActiveSelector from './is-ledger-active.js'
import isReadOnlyActiveSelector from './is-read-only-active.js'
import nextIndexSelector from './next-index.js'
import hardwareSelector from './hardware.js'
import createLightningSelector from './lightning.js'
import hasMultipleWalletAccountsEnabledSelectorDefinition from './has-multiple-wallet-accounts-enabled.js'

const createSelectorDefinitions = (config) => [
  activeWalletAccountSelector,
  activeWalletAccountIsCustodialSelector,
  activeWalletAccountNonCustodialSelector,
  getWalletAccountSelector,
  getMemoizedWalletAccountSelectorFactory,
  allWalletAccountNamesSelector,
  allWalletAccountsSelector,
  enabledWalletAccountsSelector,
  filterWalletAccountsSelector,
  hasMaxAmountOfAccountsSelector(config),
  hasMaxAmountOfLedgerAccountsSelector(config),
  hasMaxAmountOfTrezorAccountsSelector(config),
  isCustodialWalletAccountSelector,
  findSelector,
  allNonCustodialSelector,
  getProperNameSelector,
  createProperNameSelector,
  getPathFriendlyNameSelector,
  getExportPathNameSelector,
  isFTXSelector,
  isReadOnlySelector(config),
  isReadOnlyActiveSelector,
  isLedgerSelector,
  isLedgerActiveSelector,
  nextIndexSelector,
  hardwareSelector,
  createLightningSelector,
  hasMultipleWalletAccountsEnabledSelectorDefinition,
]

export default createSelectorDefinitions
