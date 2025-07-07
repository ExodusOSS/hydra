# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/multi-account-redux@2.1.0...@exodus/multi-account-redux@2.1.1) (2024-12-06)

### License

- license: re-license under MIT license (#10355)

## [2.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/multi-account-redux@2.0.1...@exodus/multi-account-redux@2.1.0) (2024-08-31)

### Features

- make multi-account-redux valid esm ([#8566](https://github.com/ExodusMovement/exodus-hydra/issues/8566)) ([1087219](https://github.com/ExodusMovement/exodus-hydra/commit/10872196fc3fb1d728afa6fd763fc11e7aa08a5e))
- pass max wallet account amount to redux module ([#4968](https://github.com/ExodusMovement/exodus-hydra/issues/4968)) ([e6ab869](https://github.com/ExodusMovement/exodus-hydra/commit/e6ab8696da1ae56921ca4faef2b964096c005280))

## [2.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/multi-account-redux@2.0.0...@exodus/multi-account-redux@2.0.1) (2023-11-29)

**Note:** Version bump only for package @exodus/multi-account-redux

## [2.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/multi-account-redux@1.7.0...@exodus/multi-account-redux@2.0.0) (2023-09-19)

### ⚠ BREAKING CHANGES

- emit defaultAccountStates from assets-load (#4072)

### Features

- emit defaultAccountStates from assets-load ([#4072](https://github.com/ExodusMovement/exodus-hydra/issues/4072)) ([1b3887a](https://github.com/ExodusMovement/exodus-hydra/commit/1b3887ab0d10c14ee90622121bf2fa6847f53b17))

## [1.7.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/multi-account-redux@1.6.1...@exodus/multi-account-redux@1.7.0) (2023-09-15)

### Features

- multi-account memoization helper ([#4078](https://github.com/ExodusMovement/exodus-hydra/issues/4078)) ([41bf8fa](https://github.com/ExodusMovement/exodus-hydra/commit/41bf8fa090e3f63713c5acb5356ddd737f0eac12))

## [1.6.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/multi-account-redux@1.6.0...@exodus/multi-account-redux@1.6.1) (2023-09-14)

### Bug Fixes

- multi account getAsset tolerance ([#4055](https://github.com/ExodusMovement/exodus-hydra/issues/4055)) ([39aa8d6](https://github.com/ExodusMovement/exodus-hydra/commit/39aa8d66f0e373ae710d41b3735a1395b5d8a793))

## [1.6.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/multi-account-redux@1.5.3...@exodus/multi-account-redux@1.6.0) (2023-09-05)

### Features

- account assets selectors ([#3833](https://github.com/ExodusMovement/exodus-hydra/issues/3833)) ([08a860d](https://github.com/ExodusMovement/exodus-hydra/commit/08a860d84e853e29db57bf3c1aa280681f6b6452))
- asset selectors ([#3834](https://github.com/ExodusMovement/exodus-hydra/issues/3834)) ([ae48023](https://github.com/ExodusMovement/exodus-hydra/commit/ae480232d1cde59e0aa7c2595b578c662c9b4aa3))

## [1.5.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/multi-account-redux@1.5.2...@exodus/multi-account-redux@1.5.3) (2023-08-30)

### Bug Fixes

- revert [#3684](https://github.com/ExodusMovement/exodus-hydra/issues/3684) (if no asset, fall back to createInitialAssetData, which may not need an asset) ([#3778](https://github.com/ExodusMovement/exodus-hydra/issues/3778)) ([229736c](https://github.com/ExodusMovement/exodus-hydra/commit/229736c9c74738765b83f8d716943843e23be2ce))

## [1.5.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/multi-account-redux@1.5.1...@exodus/multi-account-redux@1.5.2) (2023-08-30)

**Note:** Version bump only for package @exodus/multi-account-redux

## [1.5.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/multi-account-redux@1.5.0...@exodus/multi-account-redux@1.5.1) (2023-08-28)

### Bug Fixes

- if no asset, fall back to createInitialAssetData, which may not need an asset ([#3684](https://github.com/ExodusMovement/exodus-hydra/issues/3684)) ([f96ed5d](https://github.com/ExodusMovement/exodus-hydra/commit/f96ed5dcb9e0922a819d0278f8a2cd3438c48711))

## [1.5.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/multi-account-redux@1.4.0...@exodus/multi-account-redux@1.5.0) (2023-08-28)

### Features

- baseAsset selectors for multi-account-redux ([#3613](https://github.com/ExodusMovement/exodus-hydra/issues/3613)) ([5ff4650](https://github.com/ExodusMovement/exodus-hydra/commit/5ff4650ebf00b9e3e5d99957e8399b3d9b7ab74e))

## [1.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/multi-account-redux@1.3.1...@exodus/multi-account-redux@1.4.0) (2023-08-23)

### Features

- use assets redux module for assets selectors ([#3558](https://github.com/ExodusMovement/exodus-hydra/issues/3558)) ([4723c81](https://github.com/ExodusMovement/exodus-hydra/commit/4723c81f16d5915748e61ab51570b42bc89764f7))

## [1.3.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/multi-account-redux@1.3.0...@exodus/multi-account-redux@1.3.1) (2023-08-21)

### Bug Fixes

- rm invalid export ([#3501](https://github.com/ExodusMovement/exodus-hydra/issues/3501)) ([d2bce3e](https://github.com/ExodusMovement/exodus-hydra/commit/d2bce3e3d1919c1e7a3166467c2034f054bc21e1))

## [1.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/multi-account-redux@1.2.0...@exodus/multi-account-redux@1.3.0) (2023-08-21)

### Features

- add missing selector factory createAssetSourceSelectorOld ([#3493](https://github.com/ExodusMovement/exodus-hydra/issues/3493)) ([23b17a4](https://github.com/ExodusMovement/exodus-hydra/commit/23b17a462cda1d3ae426694165ce1ed37d5dc507))

## [1.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/multi-account-redux@1.1.0...@exodus/multi-account-redux@1.2.0) (2023-08-21)

### Features

- multi-account-redux module helper ([#3441](https://github.com/ExodusMovement/exodus-hydra/issues/3441)) ([60d13a6](https://github.com/ExodusMovement/exodus-hydra/commit/60d13a67a0022f2d475f23ae1e1c51073a67ca70))

## [1.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/multi-account-redux@1.0.1...@exodus/multi-account-redux@1.1.0) (2023-07-17)

### Features

- multi-account creator function ([#2657](https://github.com/ExodusMovement/exodus-hydra/issues/2657)) ([bc4068e](https://github.com/ExodusMovement/exodus-hydra/commit/bc4068ecc0f26d424e723a7f166d900281014c78))

## 1.0.1 (2023-05-03)

### Bug Fixes

- active wallet account selector usage ([#9620](https://github.com/ExodusMovement/exodus-hydra/issues/9620)) ([fa693ca](https://github.com/ExodusMovement/exodus-hydra/commit/fa693ca117d8fd50f9fcd8e0a9caf38c20360e61))
- **ftx:** add warning when sending coins to your own address ([#10483](https://github.com/ExodusMovement/exodus-hydra/issues/10483)) ([3bd9aba](https://github.com/ExodusMovement/exodus-hydra/commit/3bd9aba8f38829a3f247fd62ec4c2f066998a4cf))

### Performance Improvements

- don't call account load when it's loading ([#13169](https://github.com/ExodusMovement/exodus-hydra/issues/13169)) ([bf6f2cf](https://github.com/ExodusMovement/exodus-hydra/commit/bf6f2cfe29c518619299de0360946f736fd95eb4))
- improve custom tokens add perf by bulk adding tokens ([#12446](https://github.com/ExodusMovement/exodus-hydra/issues/12446)) ([3a3f0dd](https://github.com/ExodusMovement/exodus-hydra/commit/3a3f0dd5dd56fc130725b8bd26f970f35f0eff7e))
