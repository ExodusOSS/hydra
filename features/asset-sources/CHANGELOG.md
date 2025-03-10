# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
