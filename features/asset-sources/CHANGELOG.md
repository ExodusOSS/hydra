# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.10.0](https://github.com/ExodusMovement/exodus/compare/@exodus/asset-sources@1.9.3...@exodus/asset-sources@1.10.0) (2026-11-09)

### Features

- **asset-sources:** limit a wallet account to configured networks ([#48740](https://github.com/ExodusMovement/exodus/issues/48740)) ([5a9d173](https://github.com/ExodusMovement/exodus/commit/5a9d173f7335ed6112c644b6512756c5ca738909))

## [1.9.3](https://github.com/ExodusMovement/exodus/compare/@exodus/asset-sources@1.9.2...@exodus/asset-sources@1.9.3) (2026-10-09)

**Note:** Version bump only for package @exodus/asset-sources

## [1.9.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/asset-sources@1.9.1...@exodus/asset-sources@1.9.2) (2026-07-08)

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

- **oxlint-plugin-hydra:** port @exodus/\* eslint rules to oxlint jsPlugins ([#17280](https://github.com/ExodusMovement/exodus-hydra/issues/17280)) ([76e483c](https://github.com/ExodusMovement/exodus-hydra/commit/76e483cf8afa7035ce98279ae2ff80deb4ae6a50)), closes [#17278](https://github.com/ExodusMovement/exodus-hydra/issues/17278)
- **redux-dependency-injection:** drop unused setupRedux initialState ([#16561](https://github.com/ExodusMovement/exodus-hydra/issues/16561)) ([c906a8c](https://github.com/ExodusMovement/exodus-hydra/commit/c906a8c8cd2258060f55f0a45412b82c827dbbaa))
- **typescript:** enable erasableSyntaxOnly across the monorepo ([#16435](https://github.com/ExodusMovement/exodus-hydra/issues/16435)) ([6055ee5](https://github.com/ExodusMovement/exodus-hydra/commit/6055ee57210c9b9a6a67dc0d7b8821077da121e0))

### Bug Fixes

- **address-provider:** harden report export against unsynced hardware assets ([#17483](https://github.com/ExodusMovement/exodus-hydra/issues/17483)) ([fda0839](https://github.com/ExodusMovement/exodus-hydra/commit/fda0839d04695f6b8a3b3ea101491493387669d4))

## [1.9.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/asset-sources@1.9.0...@exodus/asset-sources@1.9.1) (2026-04-22)

### Bug Fixes

- fix: update transitive deps to versions using @exodus/models@^13.x (#15702)

## [1.9.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/asset-sources@1.8.1...@exodus/asset-sources@1.9.0) (2025-10-27)

### Features

- feat: add delegated field on WalletAccount (#14195)

## [1.8.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/asset-sources@1.8.0...@exodus/asset-sources@1.8.1) (2025-09-12)

### Bug Fixes

- fix: missing combined assets in passkeys available asset names (#13809)

## [1.8.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/asset-sources@1.7.4...@exodus/asset-sources@1.8.0) (2025-09-11)

### Features

- feat: available passkeys assets (#13804)

## [1.7.4](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/asset-sources@1.7.2...@exodus/asset-sources@1.7.4) (2024-12-05)

### License

- license: re-license under MIT license (#10580)

## [1.7.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/asset-sources@1.7.2...@exodus/asset-sources@1.7.3) (2024-11-25)

### License

- license: re-license under MIT license (#10580)

## [1.7.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/asset-sources@1.7.1...@exodus/asset-sources@1.7.2) (2024-11-21)

### Bug Fixes

- fix: don't observe walletAccountsAtom until onStart (#10535)

## [1.7.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/asset-sources@1.7.0...@exodus/asset-sources@1.7.1) (2024-10-23)

### Bug Fixes

- make `asset.baseAsset.api` optional ([#10135](https://github.com/ExodusMovement/exodus-hydra/issues/10135)) ([c647fa9](https://github.com/ExodusMovement/exodus-hydra/commit/c647fa9efacac0e3801314f811613d4bfbc0112b))

## [1.7.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/asset-sources@1.6.1...@exodus/asset-sources@1.7.0) (2024-10-21)

### Features

- add support for hardware wallet metadata on asset ([#9497](https://github.com/ExodusMovement/exodus-hydra/issues/9497)) ([8e8b0d1](https://github.com/ExodusMovement/exodus-hydra/commit/8e8b0d1fd945a93a8a37993dfceec7adb9a7a506))
- add testnets support for ledger ([#10080](https://github.com/ExodusMovement/exodus-hydra/issues/10080)) ([81d0602](https://github.com/ExodusMovement/exodus-hydra/commit/81d060295c4a1a33b182db690beb4cfe5ab8cac7))

## [1.6.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/asset-sources@1.6.0...@exodus/asset-sources@1.6.1) (2024-10-11)

### Bug Fixes

- dedupe available-asset-name-by-wallet-accounts ([#9393](https://github.com/ExodusMovement/exodus-hydra/issues/9393)) ([6a816cd](https://github.com/ExodusMovement/exodus-hydra/commit/6a816cdeed3fb915993931eee89916e8aac0f2f6))

## [1.6.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/asset-sources@1.5.0...@exodus/asset-sources@1.6.0) (2024-10-09)

### Features

- add base support to ledger ([#9871](https://github.com/ExodusMovement/exodus-hydra/issues/9871)) ([78c972c](https://github.com/ExodusMovement/exodus-hydra/commit/78c972c6c19c541c1ce26c5b6c1e31bd66bdb43b))

## [1.5.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/asset-sources@1.4.2...@exodus/asset-sources@1.5.0) (2024-10-04)

### Features

- use atoms v9 ([#9651](https://github.com/ExodusMovement/exodus-hydra/issues/9651)) ([524aa61](https://github.com/ExodusMovement/exodus-hydra/commit/524aa61f69c81e6ac00b2f94ea830688a105b3e4))

### Bug Fixes

- filter assets for ledger ([#9481](https://github.com/ExodusMovement/exodus-hydra/issues/9481)) ([f0d2f1e](https://github.com/ExodusMovement/exodus-hydra/commit/f0d2f1e23f97c5ae04c446769f7b054c858eb8fb))
- use memoize from basic-utils ([#9775](https://github.com/ExodusMovement/exodus-hydra/issues/9775)) ([602c5f6](https://github.com/ExodusMovement/exodus-hydra/commit/602c5f64c51559ed843fa5ba1af9de27f2ccc10a))

## [1.4.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/asset-sources@1.4.2...@exodus/asset-sources@1.4.3) (2024-09-26)

### Bug Fixes

- filter assets for ledger ([#9481](https://github.com/ExodusMovement/exodus-hydra/issues/9481)) ([f0d2f1e](https://github.com/ExodusMovement/exodus-hydra/commit/f0d2f1e23f97c5ae04c446769f7b054c858eb8fb))

## [1.4.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/asset-sources@1.4.1...@exodus/asset-sources@1.4.2) (2024-09-16)

### Performance Improvements

- memoize get trezor available assets ([#9258](https://github.com/ExodusMovement/exodus-hydra/issues/9258)) ([98e1669](https://github.com/ExodusMovement/exodus-hydra/commit/98e166946dd63e16a0ee59db6726e3551572c06a))

## [1.4.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/asset-sources@1.4.0...@exodus/asset-sources@1.4.1) (2024-09-09)

**Note:** Version bump only for package @exodus/asset-sources

## [1.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/asset-sources@1.3.0...@exodus/asset-sources@1.4.0) (2024-09-02)

### Features

- export `AssetSources` type from index ([#8813](https://github.com/ExodusMovement/exodus-hydra/issues/8813)) ([1164a11](https://github.com/ExodusMovement/exodus-hydra/commit/1164a11765605ffebaac95e94c6cce88d197cd75))

## [1.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/asset-sources@1.2.0...@exodus/asset-sources@1.3.0) (2024-08-31)

**Note:** Version bump only for package @exodus/asset-sources

## [1.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/asset-sources@1.1.6...@exodus/asset-sources@1.2.0) (2024-08-14)

### Features

- **exchange:** add createEnabledAssetsInWalletAccountSelector ([#8363](https://github.com/ExodusMovement/exodus-hydra/issues/8363)) ([7a48482](https://github.com/ExodusMovement/exodus-hydra/commit/7a4848278b8bc8c3ed49d25e3ba54998a4edb017))

## [1.1.6](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/asset-sources@1.1.5...@exodus/asset-sources@1.1.6) (2024-08-06)

### Bug Fixes

- **asset-sources:** ship redux module ([#8231](https://github.com/ExodusMovement/exodus-hydra/issues/8231)) ([a620b79](https://github.com/ExodusMovement/exodus-hydra/commit/a620b79bbb52dd1a61a662e6265178f970669af6))

## [1.1.5](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/asset-sources@1.1.4...@exodus/asset-sources@1.1.5) (2024-07-25)

### Bug Fixes

- migrate definitions ([#8030](https://github.com/ExodusMovement/exodus-hydra/issues/8030)) ([d2dfde5](https://github.com/ExodusMovement/exodus-hydra/commit/d2dfde55dfa843eb52842f64b3aac3a6f9a59069))

## [1.1.4](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/asset-sources@1.1.3...@exodus/asset-sources@1.1.4) (2024-07-18)

### Bug Fixes

- use default import from lodash ([#7611](https://github.com/ExodusMovement/exodus-hydra/issues/7611)) ([2e83743](https://github.com/ExodusMovement/exodus-hydra/commit/2e8374308f290e24f22e8e41b99be7b7a83d6365))

## [1.1.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/asset-sources@1.1.2...@exodus/asset-sources@1.1.3) (2024-07-01)

### Bug Fixes

- **asset-sources:** assets type definition ([#7563](https://github.com/ExodusMovement/exodus-hydra/issues/7563)) ([6e5de51](https://github.com/ExodusMovement/exodus-hydra/commit/6e5de5176ea2f4aac23609cc03262c3e4cbd287e))
- remove 44 from supported purposes for trezor if segwit is supported ([#7114](https://github.com/ExodusMovement/exodus-hydra/issues/7114)) ([12a7e06](https://github.com/ExodusMovement/exodus-hydra/commit/12a7e06cb4f696041ff6b508172a9a400007f7c9))

## [1.1.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/asset-sources@1.1.1...@exodus/asset-sources@1.1.2) (2024-05-24)

### Bug Fixes

- **asset-sources:** assetsAtom value shape ([#7121](https://github.com/ExodusMovement/exodus-hydra/issues/7121)) ([2bb2682](https://github.com/ExodusMovement/exodus-hydra/commit/2bb2682c021ec4359f95dd2bfa9063ba1d61886d))

## [1.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/asset-sources@1.1.0...@exodus/asset-sources@1.1.1) (2024-05-22)

### Bug Fixes

- **asset-sources:** register plugin ([#7027](https://github.com/ExodusMovement/exodus-hydra/issues/7027)) ([913630e](https://github.com/ExodusMovement/exodus-hydra/commit/913630e1b38a46e4e6f776df59b0a11515be5cb8))

## [1.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/asset-sources@1.0.0...@exodus/asset-sources@1.1.0) (2024-05-15)

### Features

- asset-sources lifecycle plugin and redux ([#6955](https://github.com/ExodusMovement/exodus-hydra/issues/6955)) ([8dcdaca](https://github.com/ExodusMovement/exodus-hydra/commit/8dcdaca9b473456d9d72ba54658b4827ce73eb4e))
