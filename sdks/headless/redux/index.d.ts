import type { ReduxIOC, ReduxIOCParams } from '@exodus/argo/redux'

import type assetsRedux from '@exodus/assets-feature/redux/index.js'
import type localeRedux from '@exodus/locale/redux/index.js'
import type remoteConfigRedux from '@exodus/remote-config/redux'

// The pre-registered redux modules whose selectors are typed today. `createExodusRedux`
// registers ~16 modules at runtime (see index.js), but a single `any` in a union
// collapses the whole `Selectors<>` intersection to `any`, and most feature redux
// modules are still untyped JS. Listing only the typed ones keeps their selectors
// precise.
//
// TRADE-OFF: a still-untyped module is registered at runtime but absent here, so
// `selectors.<thatModule>` is a compile error until it's added to this union.
// Modules join once they resolve to precise types: the untyped JS modules need
// selector `.d.ts` declarations (or a TS migration); the TypeScript-source modules
// that only expose `./redux` via their `exports` map (application, rates-monitor,
// wallet-accounts, …) resolve automatically once headless typechecks under
// `moduleResolution: nodenext` — no per-package shim needed.
type ExodusReduxModules = typeof assetsRedux | typeof localeRedux | typeof remoteConfigRedux

export default function createExodusRedux(params: ReduxIOCParams): ReduxIOC<ExodusReduxModules>
