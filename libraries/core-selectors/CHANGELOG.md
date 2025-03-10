# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/core-selectors@4.0.0...@exodus/core-selectors@4.0.1) (2025-03-05)

**Note:** Version bump only for package @exodus/core-selectors

## 4.0.0 (2024-12-06)

### ⚠ BREAKING CHANGES

- bump assets-base dependencies to ESM / bigint (#1271)
- convert /core-selectors to ESM (#1265)
- remove create-asset-multi-account-incoming-orders selector (#1124)
- remove unused create-account-incoming-orders selector (#1123)
- remove reliance on @exodus/assets from Order (#778)

### Features

- feat: add arbitrum tokens (#783)

- feat(assets-base): bump `@exodus/ethereum-meta` lib in assets-base (#1176)

- feat!: bump assets-base dependencies to ESM / bigint (#1271)

- feat!: convert /core-selectors to ESM (#1265)

- feat(core-selectors): add reselect-proxy (#995)

- feat: getParentCombinedAsset selector (#891)

- feat: incoming tx selectors (#873)

- feat: mirror selector utils from mobile (#759)

- feat: more combined asset selectors (#921)

- feat!: remove create-asset-multi-account-incoming-orders selector (#1124)

- feat!: remove unused create-account-incoming-orders selector (#1123)

### Bug Fixes

- fix: ignore coverage folder for npm (#761)

- fix(reselect-proxy): log function name for combined time (#1012)

- fix(reselect-proxy): monitor resultFunc only (#1010)

- fix: selector should accept deps (#893)

- refactor!: remove reliance on @exodus/assets from Order (#778)

### License

- license: re-license under MIT license (#10355)

## [3.0.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/core-selectors@2.0.0...@exodus/core-selectors@3.0.0) (2024-08-08)

### ⚠ BREAKING CHANGES

- bump assets-base dependencies to ESM / bigint (#1271)
- convert /core-selectors to ESM (#1265)

### Features

- **assets-base:** bump `@exodus/ethereum-meta` lib in assets-base ([#1176](https://github.com/ExodusMovement/exodus-core/issues/1176)) ([d9a9ee2](https://github.com/ExodusMovement/exodus-core/commit/d9a9ee20cfd010f6ebf6616936c2b24f1b9c76c8))
- bump assets-base dependencies to ESM / bigint ([#1271](https://github.com/ExodusMovement/exodus-core/issues/1271)) ([7d4df69](https://github.com/ExodusMovement/exodus-core/commit/7d4df69a807e482ea39c9236c48bb39bfc730083))
- convert /core-selectors to ESM ([#1265](https://github.com/ExodusMovement/exodus-core/issues/1265)) ([408cc0a](https://github.com/ExodusMovement/exodus-core/commit/408cc0ae0d410a3a259cebb1898e5d9c977d3307))

## [2.0.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/core-selectors@1.6.1...@exodus/core-selectors@2.0.0) (2024-03-25)

### ⚠ BREAKING CHANGES

- remove create-asset-multi-account-incoming-orders selector (#1124)
- remove unused create-account-incoming-orders selector (#1123)

### Features

- remove create-asset-multi-account-incoming-orders selector ([#1124](https://github.com/ExodusMovement/exodus-core/issues/1124)) ([9cd6bed](https://github.com/ExodusMovement/exodus-core/commit/9cd6bed9782ddc5653d2c6ff738cc8d60bc8f437))
- remove unused create-account-incoming-orders selector ([#1123](https://github.com/ExodusMovement/exodus-core/issues/1123)) ([40f31cc](https://github.com/ExodusMovement/exodus-core/commit/40f31cccb006497a5cafbcbb72d5a5bb4f934525))

## [1.6.1](https://github.com/ExodusMovement/exodus-core/compare/@exodus/core-selectors@1.6.0...@exodus/core-selectors@1.6.1) (2023-11-22)

### Bug Fixes

- **reselect-proxy:** log function name for combined time ([#1012](https://github.com/ExodusMovement/exodus-core/issues/1012)) ([b8baa42](https://github.com/ExodusMovement/exodus-core/commit/b8baa42ebe930638cff22a1b7550258a81dd3994))
- **reselect-proxy:** monitor resultFunc only ([#1010](https://github.com/ExodusMovement/exodus-core/issues/1010)) ([b478685](https://github.com/ExodusMovement/exodus-core/commit/b478685498961c8bf40484706ab1f300a43908b3))

# [1.6.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/core-selectors@1.5.0...@exodus/core-selectors@1.6.0) (2023-11-10)

### Features

- **core-selectors:** add reselect-proxy ([#995](https://github.com/ExodusMovement/exodus-core/issues/995)) ([69658bc](https://github.com/ExodusMovement/exodus-core/commit/69658bc7224bc8eb8f9b5dd3700d2725bd2952fd))

# [1.5.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/core-selectors@1.4.0...@exodus/core-selectors@1.5.0) (2023-08-08)

### Features

- more combined asset selectors ([#921](https://github.com/ExodusMovement/exodus-core/issues/921)) ([fda6b15](https://github.com/ExodusMovement/exodus-core/commit/fda6b151e14d16022fa691ac0d47037d39eafe83))

# [1.4.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/core-selectors@1.3.0...@exodus/core-selectors@1.4.0) (2023-07-13)

### Bug Fixes

- selector should accept deps ([#893](https://github.com/ExodusMovement/exodus-core/issues/893)) ([dce41e1](https://github.com/ExodusMovement/exodus-core/commit/dce41e15fced95429849f7b739089d2f50a210b9))

### Features

- getParentCombinedAsset selector ([#891](https://github.com/ExodusMovement/exodus-core/issues/891)) ([723bf51](https://github.com/ExodusMovement/exodus-core/commit/723bf51d52c3c2f98f91ad96e52fb78adb22dabe))

# [1.3.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/core-selectors@1.2.0...@exodus/core-selectors@1.3.0) (2023-06-23)

### Features

- incoming tx selectors ([#873](https://github.com/ExodusMovement/exodus-core/issues/873)) ([8bbc323](https://github.com/ExodusMovement/exodus-core/commit/8bbc3236c78a54dc6633477804d06650de5c20bb))

# 1.2.0 (2023-03-31)

### Bug Fixes

- ignore coverage folder for npm ([#761](https://github.com/ExodusMovement/exodus-core/issues/761)) ([7db5f95](https://github.com/ExodusMovement/exodus-core/commit/7db5f95aa683f3db6932dc5e473fd6f95b2f3306))

### Features

- add arbitrum tokens ([#783](https://github.com/ExodusMovement/exodus-core/issues/783)) ([852bc91](https://github.com/ExodusMovement/exodus-core/commit/852bc910316c32e62622e78e83b1ad4c222f1023))

## 1.1.7 / 2023-03-14

- mirror selector utils from mobile ([#759](https://github.com/ExodusMovement/exodus-core/issues/759)) ([0fee1ef](https://github.com/ExodusMovement/exodus-core/commit/0fee1efe922c1035976111e7f81600c4334bd68e))

## 1.1.6 / 2022-10-14

feat: export createCombinedAssetCanBeExchangedSelectorCreator

## 1.1.5 / 2022-09-09

feat: export createParentCombinedNetworkAssetsSelector

## 1.1.4 / 2022-08-12

Fix: publish utils

## 1.1.3 / 2022-08-12

Chore: orders selectors

## 1.0.3 / 2022-08-22

fix: don't use optional chaining operator

## 1.0.2 / 2022-08-16

Feat: add available prop for networks in combined assets

## 1.0.1 / 2022-06-13

Refactor: memoize selector creators

## 1.0.0 / 2022-06-05

Initial commit
