# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [5.0.0](https://github.com/ExodusMovement/hydra/compare/@exodus/redux-dependency-injection@4.5.0...@exodus/redux-dependency-injection@5.0.0) (2026-06-05)

### ⚠ BREAKING CHANGES

- **redux-dependency-injection:** `setupRedux` no longer accepts an `initialState`
  parameter. Callers passing it must remove that property — every known
  caller passed `{}` so the migration is mechanical.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

- fix(argo): drop now-rejected initialState arg from setupRedux call

Mechanical follow-up to @exodus/redux-dependency-injection dropping
the `initialState` parameter. The `initialState: {}` line was always a
no-op; with the new major it would throw at runtime.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

- test: drop now-unused initialState arg from setupRedux test fixtures

Mechanical follow-up to the @exodus/redux-dependency-injection major in
the previous commit. The `setupRedux({initialState: {}})` line in each
fixture was always a no-op; it now type-errors and must be removed.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

- feat(redux-dependency-injection): throw on passed `initialState` for unmigrated callers

TypeScript catches `setupRedux({ initialState })` at the type level for
typed callers — but excess-property checks don't fire on
generic-constrained params, JS callers have no type wall at all, and
any-typed wrappers slip through. Add a runtime guard so unmigrated
consumers get a clear error pointing them at the module-level
`initialState` field instead of silent no-op behavior.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>

- fix(redux-dependency-injection): preserve empty-object state fallback for module-less deps

When `setupRedux` is called with `dependencies: []` (or an array
containing only `DependencyNodeDefinition`s with no redux-modules),
the distributive mapped type collapses to `UnionToIntersection<never>`,
which widens to `unknown` and leaks through to `initialState` and the
reducer signature.

Guard with an explicit `Record<string, never>` fallback when no
redux-module arms are present in the dependency union. Matches the
runtime, where `buildInitialState` returns an empty object in that
case. Adds a `__tests__/types.ts` assertion that locks the fallback in
structurally.

### Features

- **redux-dependency-injection:** drop unused setupRedux initialState ([#16561](https://github.com/ExodusMovement/hydra/issues/16561)) ([c906a8c](https://github.com/ExodusMovement/hydra/commit/c906a8c8cd2258060f55f0a45412b82c827dbbaa))

## [4.5.0](https://github.com/ExodusMovement/hydra/compare/@exodus/redux-dependency-injection@4.4.0...@exodus/redux-dependency-injection@4.5.0) (2026-04-29)

### Features

- feat(polymarket): track deposit/withdraw via pendingOrders atom (#16127)

## [4.4.0](https://github.com/ExodusMovement/hydra/compare/@exodus/redux-dependency-injection@4.3.0...@exodus/redux-dependency-injection@4.4.0) (2026-04-28)

### Features

- feat(redux-dependency-injection): reject widened selector ids at setupRedux (#16170)

## [4.3.0](https://github.com/ExodusMovement/hydra/compare/@exodus/redux-dependency-injection@4.2.0...@exodus/redux-dependency-injection@4.3.0) (2026-04-27)

### Features

- feat(redux-dependency-injection): expose typed combinedReducer (#16208)

## [4.2.0](https://github.com/ExodusMovement/hydra/compare/@exodus/redux-dependency-injection@4.1.2...@exodus/redux-dependency-injection@4.2.0) (2026-04-13)

### Features

- feat: refactor redux-dependency-injection to use typed helpers (#15607)

## [4.1.2](https://github.com/ExodusMovement/hydra/compare/@exodus/redux-dependency-injection@4.1.1...@exodus/redux-dependency-injection@4.1.2) (2025-08-13)

**Note:** Version bump only for package @exodus/redux-dependency-injection

## [4.1.1](https://github.com/ExodusMovement/hydra/compare/@exodus/redux-dependency-injection@4.1.0...@exodus/redux-dependency-injection@4.1.1) (2024-11-25)

### License

- license: re-license under MIT license (#10339)

## [4.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/redux-dependency-injection@4.0.3...@exodus/redux-dependency-injection@4.1.0) (2024-11-19)

### Features

- feat: generic redux module state (#10073)

## [4.0.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/redux-dependency-injection@4.0.2...@exodus/redux-dependency-injection@4.0.3) (2024-09-09)

**Note:** Version bump only for package @exodus/redux-dependency-injection

## [4.0.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/redux-dependency-injection@4.0.1...@exodus/redux-dependency-injection@4.0.2) (2024-09-03)

**Note:** Version bump only for package @exodus/redux-dependency-injection

## [4.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/redux-dependency-injection@4.0.0...@exodus/redux-dependency-injection@4.0.1) (2024-08-21)

**Note:** Version bump only for package @exodus/redux-dependency-injection

## [4.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/redux-dependency-injection@3.2.4...@exodus/redux-dependency-injection@4.0.0) (2024-07-26)

**Note:** Version bump only for package @exodus/redux-dependency-injection

## [3.2.4](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/redux-dependency-injection@3.2.3...@exodus/redux-dependency-injection@3.2.4) (2024-07-25)

### Bug Fixes

- use clean ESM for redux-di ([#8057](https://github.com/ExodusMovement/exodus-hydra/issues/8057)) ([e129623](https://github.com/ExodusMovement/exodus-hydra/commit/e129623e11333f516fb2320fdb5e147d6cfec51b))

## [3.2.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/redux-dependency-injection@3.2.2...@exodus/redux-dependency-injection@3.2.3) (2024-06-25)

**Note:** Version bump only for package @exodus/redux-dependency-injection

## [3.2.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/redux-dependency-injection@3.2.1...@exodus/redux-dependency-injection@3.2.2) (2024-06-18)

### Bug Fixes

- **types:** selector to receive a single state param ([#7430](https://github.com/ExodusMovement/exodus-hydra/issues/7430)) ([0cdfcd7](https://github.com/ExodusMovement/exodus-hydra/commit/0cdfcd75ef775c88bd008cf5d834392310e1563b))

## [3.2.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/redux-dependency-injection@3.2.0...@exodus/redux-dependency-injection@3.2.1) (2024-06-14)

### Bug Fixes

- named export and add missing exports ([#7390](https://github.com/ExodusMovement/exodus-hydra/issues/7390)) ([4047c8c](https://github.com/ExodusMovement/exodus-hydra/commit/4047c8cdc7d26634965d623bac7665d3412c560d))

## [3.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/redux-dependency-injection@3.1.0...@exodus/redux-dependency-injection@3.2.0) (2024-06-14)

### Features

- type inference for selectors ([#7373](https://github.com/ExodusMovement/exodus-hydra/issues/7373)) ([3c1822a](https://github.com/ExodusMovement/exodus-hydra/commit/3c1822ab4460ea8e472c5430260c60c4ed48747a))

## [3.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/redux-dependency-injection@3.0.0...@exodus/redux-dependency-injection@3.1.0) (2024-04-29)

### Features

- **redux-dependency-injection:** support optional selector dependencies ([#6718](https://github.com/ExodusMovement/exodus-hydra/issues/6718)) ([f8e1d6f](https://github.com/ExodusMovement/exodus-hydra/commit/f8e1d6f8bbd9cf0218c5bc53d468f0634ffe5809))

## [3.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/redux-dependency-injection@2.0.1...@exodus/redux-dependency-injection@3.0.0) (2023-08-30)

### ⚠ BREAKING CHANGES

- generate logger selector (#3733)

### Features

- generate logger selector ([#3733](https://github.com/ExodusMovement/exodus-hydra/issues/3733)) ([6cdbeba](https://github.com/ExodusMovement/exodus-hydra/commit/6cdbebad61afe95bff2d6f94eb7772ef9e0ff23b))

## [2.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/redux-dependency-injection@2.0.0...@exodus/redux-dependency-injection@2.0.1) (2023-08-24)

### Bug Fixes

- remove jest from deps ([#3607](https://github.com/ExodusMovement/exodus-hydra/issues/3607)) ([7195d19](https://github.com/ExodusMovement/exodus-hydra/commit/7195d19e06f1ba57771b3da7cf787857483e464c))

## [2.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/redux-dependency-injection@1.0.2...@exodus/redux-dependency-injection@2.0.0) (2023-08-24)

### ⚠ BREAKING CHANGES

- remove store and actions from setup redux (#3575)

### Features

- add support for action reducers ([#3592](https://github.com/ExodusMovement/exodus-hydra/issues/3592)) ([22d94af](https://github.com/ExodusMovement/exodus-hydra/commit/22d94af009c509298490dca010da315b71113780))

### Code Refactoring

- remove store and actions from setup redux ([#3575](https://github.com/ExodusMovement/exodus-hydra/issues/3575)) ([64fa4a6](https://github.com/ExodusMovement/exodus-hydra/commit/64fa4a6c2b69409a81ab140adbdf84646f1be73a))

## [1.0.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/redux-dependency-injection@1.0.1...@exodus/redux-dependency-injection@1.0.2) (2023-08-14)

**Note:** Version bump only for package @exodus/redux-dependency-injection

## [1.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/redux-dependency-injection@1.0.0...@exodus/redux-dependency-injection@1.0.1) (2023-05-08)

### Bug Fixes

- provide reducers keyed by name ([#1562](https://github.com/ExodusMovement/exodus-hydra/issues/1562)) ([de17e02](https://github.com/ExodusMovement/exodus-hydra/commit/de17e0285988046f7eb943658157625ca41c5c2b))
