# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [8.8.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/available-assets@8.6.0...@exodus/available-assets@8.8.0) (2025-08-22)

### Features

- feat: memoize available asset names atom selector (#10829)

- feat: use atoms v9 (#9651)

### License

- license: re-license under MIT license (#10580)

## [8.7.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/available-assets@8.6.0...@exodus/available-assets@8.7.0) (2024-11-25)

### Features

- feat: use atoms v9 (#9651)

### License

- license: re-license under MIT license (#10580)

## [8.6.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/available-assets@8.5.0...@exodus/available-assets@8.5.1) (2024-09-30)

### Refactor

- migrate network icon selectors to hydra ([9525](https://github.com/ExodusMovement/exodus-hydra/pull/9525))

## [8.5.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/available-assets@8.4.1...@exodus/available-assets@8.5.0) (2024-08-21)

### Features

- **available-assets, enabled-assets:** convert to valid ESM ([#8586](https://github.com/ExodusMovement/exodus-hydra/issues/8586)) ([220188c](https://github.com/ExodusMovement/exodus-hydra/commit/220188cab6712e2ea5a0daff4731cfccde90e75b))

## [8.4.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/available-assets@8.4.0...@exodus/available-assets@8.4.1) (2024-07-26)

### Bug Fixes

- mark optional configs as optional and remove unused configs ([#8075](https://github.com/ExodusMovement/exodus-hydra/issues/8075)) ([c1c990d](https://github.com/ExodusMovement/exodus-hydra/commit/c1c990dfcea35874d4bbc8429e97688e17977a9f))

## [8.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/available-assets@8.3.1...@exodus/available-assets@8.4.0) (2024-07-25)

### Features

- **available-assets:** add default available assets. make this config optional ([#7936](https://github.com/ExodusMovement/exodus-hydra/issues/7936)) ([491a901](https://github.com/ExodusMovement/exodus-hydra/commit/491a9019efd135d6c8e65a4f20710a5ecaedc81c))

### Bug Fixes

- migrate definitions ([#8030](https://github.com/ExodusMovement/exodus-hydra/issues/8030)) ([d2dfde5](https://github.com/ExodusMovement/exodus-hydra/commit/d2dfde55dfa843eb52842f64b3aac3a6f9a59069))

## [8.3.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/available-assets@8.3.0...@exodus/available-assets@8.3.1) (2024-07-18)

**Note:** Version bump only for package @exodus/available-assets

## [8.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/available-assets@8.2.1...@exodus/available-assets@8.3.0) (2024-06-14)

### Features

- (available-assets) adds config in the feature level [#7365](https://github.com/ExodusMovement/exodus-hydra/issues/7365) ([#7393](https://github.com/ExodusMovement/exodus-hydra/issues/7393)) ([7026209](https://github.com/ExodusMovement/exodus-hydra/commit/702620933b974cd0b2f21eeea708ebc6269e01b9))

## [8.2.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/available-assets@8.2.0...@exodus/available-assets@8.2.1) (2024-05-16)

### Bug Fixes

- rm available-asset-names-by-wallet-account from available-assets feature ([#6957](https://github.com/ExodusMovement/exodus-hydra/issues/6957)) ([50ceb76](https://github.com/ExodusMovement/exodus-hydra/commit/50ceb761a8d2c9cdac6b45a39767353b59447a4e))

## [8.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/available-assets@8.1.0...@exodus/available-assets@8.2.0) (2024-05-03)

### Features

- assetNamesByWalletAccount redux state + selector ([#6778](https://github.com/ExodusMovement/exodus-hydra/issues/6778)) ([1f3cc6f](https://github.com/ExodusMovement/exodus-hydra/commit/1f3cc6fa9d32c6e410187dc7e5a17b651799ba22))
- available-asset-names-by-wallet-account ([#6777](https://github.com/ExodusMovement/exodus-hydra/issues/6777)) ([be6d8a0](https://github.com/ExodusMovement/exodus-hydra/commit/be6d8a0e1a81bbab37d9f6acf50ea644e39e83b9))

## [8.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/available-assets@8.0.1...@exodus/available-assets@8.1.0) (2024-04-23)

### Features

- type remaining API methods shipped with headless ([#6619](https://github.com/ExodusMovement/exodus-hydra/issues/6619)) ([d1ec08e](https://github.com/ExodusMovement/exodus-hydra/commit/d1ec08e695f0df2c9e63b01169c746ef872fe541))

## [8.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/available-assets@8.0.0...@exodus/available-assets@9.0.0) (2024-03-18)

### Bug Fixes

- **available-assets:** assets add/update event names ([#6159](https://github.com/ExodusMovement/exodus-hydra/issues/6159)) ([e54e8f3](https://github.com/ExodusMovement/exodus-hydra/commit/e54e8f3524a60f0286bf8ace578b0837b74c71dd))

## [8.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/available-assets@7.0.0...@exodus/available-assets@8.0.0) (2023-11-22)

### ⚠ BREAKING CHANGES

- use `assetsAtom` instead of legacy events (#4837)

### Features

- prepare `eslint-plugin-hydra` for publishing ([#4671](https://github.com/ExodusMovement/exodus-hydra/issues/4671)) ([9a01c10](https://github.com/ExodusMovement/exodus-hydra/commit/9a01c10757f3f5d7add361f31cf798e5c207044d))

### Bug Fixes

- cleanup subscriptions on stop ([#4591](https://github.com/ExodusMovement/exodus-hydra/issues/4591)) ([23c9e6b](https://github.com/ExodusMovement/exodus-hydra/commit/23c9e6b4a89a63754cfd4a01345e02758bf03794))

### Code Refactoring

- use `assetsAtom` instead of legacy events ([#4837](https://github.com/ExodusMovement/exodus-hydra/issues/4837)) ([ae083c2](https://github.com/ExodusMovement/exodus-hydra/commit/ae083c2588b996f053f54ba49c48883ae6314cc6))

## [7.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/available-assets@6.0.0...@exodus/available-assets@7.0.0) (2023-10-13)

### ⚠ BREAKING CHANGES

- add reason to available assets (#4398)

### Features

- add reason to available assets ([#4398](https://github.com/ExodusMovement/exodus-hydra/issues/4398)) ([cdcc028](https://github.com/ExodusMovement/exodus-hydra/commit/cdcc0283fb49a1b1f282fde6330c4b479378a156))

## [6.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/available-assets@5.2.0...@exodus/available-assets@6.0.0) (2023-09-27)

### ⚠ BREAKING CHANGES

- selector name (#4247)

### Bug Fixes

- selector name ([#4247](https://github.com/ExodusMovement/exodus-hydra/issues/4247)) ([c611677](https://github.com/ExodusMovement/exodus-hydra/commit/c6116775c805f64df432a37afd251c0420e09608))

## [5.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/available-assets@5.1.1...@exodus/available-assets@5.2.0) (2023-09-25)

### Features

- getParentCombined selector ([#4210](https://github.com/ExodusMovement/exodus-hydra/issues/4210)) ([fc6b1cb](https://github.com/ExodusMovement/exodus-hydra/commit/fc6b1cb62bde8c64ef7f22e482f71f62f0688992))

## [5.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/available-assets@5.1.0...@exodus/available-assets@5.1.1) (2023-08-28)

### Bug Fixes

- downgrade reselect ([#3665](https://github.com/ExodusMovement/exodus-hydra/issues/3665)) ([8a03e20](https://github.com/ExodusMovement/exodus-hydra/commit/8a03e2089d3211ddc71cff212c45a6e7f248aa08))

## [5.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/available-assets@5.0.0...@exodus/available-assets@5.1.0) (2023-08-25)

### Features

- add combined selectors to available-assets ([#3546](https://github.com/ExodusMovement/exodus-hydra/issues/3546)) ([0ed95c1](https://github.com/ExodusMovement/exodus-hydra/commit/0ed95c138add72efb920f1d4d8b4605c4a7aedc1))

## [5.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/available-assets@4.1.0...@exodus/available-assets@5.0.0) (2023-08-25)

### ⚠ BREAKING CHANGES

- remove store and actions from setup redux (#3575)

### Features

- add atom observer in available-assets plugin ([#3553](https://github.com/ExodusMovement/exodus-hydra/issues/3553)) ([26d769c](https://github.com/ExodusMovement/exodus-hydra/commit/26d769c0536d4c0f99b5ea4ca5a7f4123ba16d6f))

### Code Refactoring

- remove store and actions from setup redux ([#3575](https://github.com/ExodusMovement/exodus-hydra/issues/3575)) ([64fa4a6](https://github.com/ExodusMovement/exodus-hydra/commit/64fa4a6c2b69409a81ab140adbdf84646f1be73a))

## [4.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/available-assets@4.0.0...@exodus/available-assets@4.1.0) (2023-08-22)

### Features

- add available-assets redux module ([#3504](https://github.com/ExodusMovement/exodus-hydra/issues/3504)) ([6a2cb36](https://github.com/ExodusMovement/exodus-hydra/commit/6a2cb368f35258c47e61f386bddc3e72e70c1c80))

## [4.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/available-assets@3.0.1...@exodus/available-assets@4.0.0) (2023-08-10)

### ⚠ BREAKING CHANGES

- export available-assets atom defs from atoms (#3289)

### Features

- add api to available-assets ([#3282](https://github.com/ExodusMovement/exodus-hydra/issues/3282)) ([9346308](https://github.com/ExodusMovement/exodus-hydra/commit/9346308900b71a037a99db03f671312b2bd335da))
- add atom for non combined available assets ([#3283](https://github.com/ExodusMovement/exodus-hydra/issues/3283)) ([1b8ad10](https://github.com/ExodusMovement/exodus-hydra/commit/1b8ad10966c5f6d963eae2aa005a1146ceeaf7af))

### Code Refactoring

- export available-assets atom defs from atoms ([#3289](https://github.com/ExodusMovement/exodus-hydra/issues/3289)) ([7d03daf](https://github.com/ExodusMovement/exodus-hydra/commit/7d03daf4f4d67bece73415868fa4ca46f2aecaa9))

## [3.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/available-assets@2.0.3...@exodus/available-assets@3.0.1) (2023-07-26)

### Bug Fixes

- available-assets typo ([#2964](https://github.com/ExodusMovement/exodus-hydra/issues/2964)) ([d76adea](https://github.com/ExodusMovement/exodus-hydra/commit/d76adeaf186648199bdb335d568b97de6de4f8df))

## [3.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/available-assets@2.0.3...@exodus/available-assets@3.0.0) (2023-07-24)

### ⚠ BREAKING CHANGES

- available-assets feature (#2831)

### Features

- available-assets feature ([#2831](https://github.com/ExodusMovement/exodus-hydra/issues/2831)) ([ec082db](https://github.com/ExodusMovement/exodus-hydra/commit/ec082db68823ebc75bb1332ac2bc1c26f50dbccd))

### Bug Fixes

- auto-fix lint issues ([#2443](https://github.com/ExodusMovement/exodus-hydra/issues/2443)) ([e280366](https://github.com/ExodusMovement/exodus-hydra/commit/e280366b53dabc25280fd16c9e44f812a10f3e65))

## [2.0.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/available-assets@2.0.2...@exodus/available-assets@2.0.3) (2023-07-05)

### Bug Fixes

- making assets available ([#2281](https://github.com/ExodusMovement/exodus-hydra/issues/2281)) ([5daf0d9](https://github.com/ExodusMovement/exodus-hydra/commit/5daf0d9e392790d48f2c82ac5eaa74f2e6dc1d51))

## [2.0.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/available-assets@2.0.1...@exodus/available-assets@2.0.2) (2023-06-21)

**Note:** Version bump only for package @exodus/available-assets

## [2.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/available-assets@2.0.0...@exodus/available-assets@2.0.1) (2023-06-13)

### Bug Fixes

- **available-assets:** auto-make unavailable built-in tokens available ([#1901](https://github.com/ExodusMovement/exodus-hydra/issues/1901)) ([9e46b62](https://github.com/ExodusMovement/exodus-hydra/commit/9e46b628d8ba1bc30391b5409c8e55280df51dc1))

## 2.0.0 (2023-04-25)

### ⚠ BREAKING CHANGES

- available-assets module to DI definition (#1339)

### Features

- factor out availableAssetModule ([#1924](https://github.com/ExodusMovement/exodus-hydra/issues/1924)) ([e08bd1c](https://github.com/ExodusMovement/exodus-hydra/commit/e08bd1c2319b679e752bc69db1a67790fc6cdbc7))

### Code Refactoring

- available-assets module to DI definition ([#1339](https://github.com/ExodusMovement/exodus-hydra/issues/1339)) ([d98f38b](https://github.com/ExodusMovement/exodus-hydra/commit/d98f38b666f5ab58eb08a38bfd9d0c36899df13e))
