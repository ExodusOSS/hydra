import type { State } from '../initial-state.js'
import { setup } from './utils.js'

/**
 * End-to-end type assertions for `selectors.remoteConfig.<name>`.
 *
 * Purpose: guard against regressions where `setupRedux`'s per-key selector
 * inference collapses (e.g. a widened `id: string` on one `selectorDefinitions`
 * element turns every selector into a union + `undefined`). Each assertion
 * below fails at compile time if the named selector no longer resolves to a
 * single, concrete signature.
 *
 * This file intentionally contains no runtime `describe`/`it` — the
 * assertions are type-level and are enforced by `tsc --noEmit`.
 */

const { selectors } = setup()
void selectors

type AssertEqual<Actual, Expected> =
  (<T>() => T extends Actual ? 1 : 2) extends <T>() => T extends Expected ? 1 : 2 ? true : false

// ---------------------------------------------------------------------------
// factory selectors — instance is `(...factoryArgs) => (state) => Result`.
// Pinned via Parameters + ReturnType<ReturnType<...>> so the assertion checks
// the factory's call shape and the returned selector's output, independent of
// reselect's internal selector type.
// ---------------------------------------------------------------------------

type _getArgs = AssertEqual<Parameters<typeof selectors.remoteConfig.get>, [path: string]>
const _getArgsOk: _getArgs = true
void _getArgsOk

type _getResult = AssertEqual<ReturnType<ReturnType<typeof selectors.remoteConfig.get>>, unknown>
const _getResultOk: _getResult = true
void _getResultOk

// ---------------------------------------------------------------------------
// initial-state selectors — setupRedux auto-emits one per top-level
// `initialState` key. Instance is `(state) => State[key]`.
// ---------------------------------------------------------------------------

type _loaded = AssertEqual<ReturnType<typeof selectors.remoteConfig.loaded>, State['loaded']>
const _loadedOk: _loaded = true
void _loadedOk

type _data = AssertEqual<ReturnType<typeof selectors.remoteConfig.data>, State['data']>
const _dataOk: _data = true
void _dataOk
