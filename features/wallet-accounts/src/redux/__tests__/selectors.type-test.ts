// Framework-level regression test for `selectors.walletAccounts.*`.
//
// The per-selector return types are pinned at the source (via explicit
// annotations on each selector's resultFunction / selectorFactory combiner).
// This file only guards against regressions where `setupRedux`'s per-key
// selector inference collapses — e.g., a selectorDefinitions element widening
// `id` to `string` would turn every key into a union of ids and break the
// mapping here.
//
// If any listed id is missing from the inferred `Selectors['walletAccounts']`
// namespace, the intersection below evaluates to `never` and the value-level
// check fails `tsc --noEmit`.
//
// This file intentionally contains no runtime `describe`/`it`.

import type { setupRedux } from '@exodus/redux-dependency-injection'

import type createReduxDefinition from '../index.js'

type Selectors = ReturnType<
  typeof setupRedux<{ dependencies: [ReturnType<typeof createReduxDefinition>] }>
>['selectors']

type AssertEqual<Actual, Expected> =
  (<T>() => T extends Actual ? 1 : 2) extends <T>() => T extends Expected ? 1 : 2 ? true : false

// The inferred key-set of `selectors.walletAccounts` must be exactly the set
// of explicit selectorDefinitions ids + the top-level initialState keys
// (setupRedux auto-emits an instance-state selector per top-level State key).
// Fires if:
//   - an id is renamed (missing from the inferred namespace);
//   - an id widens to `string` (keyof collapses to `string`);
//   - a new selector is added but this test isn't updated.
type ExplicitIds =
  | 'active'
  | 'activeIsCustodial'
  | 'activeNonCustodial'
  | 'get'
  | 'getMemoized'
  | 'names'
  | 'all'
  | 'enabled'
  | 'filter'
  | 'hasMaxAmountOfAccounts'
  | 'hasMaxAmountOfLedgerAccounts'
  | 'hasMaxAmountOfTrezorAccounts'
  | 'isCustodial'
  | 'find'
  | 'allNonCustodial'
  | 'getProperName'
  | 'createProperNameSelector'
  | 'getPathFriendlyName'
  | 'getExportPathName'
  | 'isFTX'
  | 'isReadOnly'
  | 'isReadOnlyActive'
  | 'isLedger'
  | 'isLedgerActive'
  | 'nextIndex'
  | 'hardware'
  | 'createLightning'
  | 'hasMultipleWalletAccountsEnabledSelector'

type InstanceStateIds =
  | 'error'
  | 'configuredActiveWalletAccountLoaded'
  | 'multipleWalletAccountsEnabledLoaded'
  | 'walletAccountsDataLoaded'
  | 'loaded'
  | 'data'
  | 'multipleWalletAccountsEnabled'
  | 'configuredActiveWalletAccount'

type DeclaredIds = ExplicitIds | InstanceStateIds

type _idsPreserved = AssertEqual<keyof Selectors['walletAccounts'], DeclaredIds>
const _idsPreservedOk: _idsPreserved = true
void _idsPreservedOk
