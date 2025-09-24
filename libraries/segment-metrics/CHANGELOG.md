# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.0.3](https://github.com/ExodusMovement/hydra/compare/@exodus/segment-metrics@4.0.2...@exodus/segment-metrics@4.0.3) (2024-11-01)

Re-licensed under MIT license.

## [4.0.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/segment-metrics@4.0.1...@exodus/segment-metrics@4.0.2) (2024-08-22)

### Bug Fixes

- **segment-metrics:** add missing `.debug` method to `noopLogger` ([#8598](https://github.com/ExodusMovement/exodus-hydra/issues/8598)) ([bf61d3a](https://github.com/ExodusMovement/exodus-hydra/commit/bf61d3a82dd31e2857d06d6fff35390b56b1d3af))

## [4.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/segment-metrics@4.0.0...@exodus/segment-metrics@4.0.1) (2024-08-20)

### Bug Fixes

- **segment-metrics:** stop using runtime dependent URL.canParse ([#8556](https://github.com/ExodusMovement/exodus-hydra/issues/8556)) ([f0e254c](https://github.com/ExodusMovement/exodus-hydra/commit/f0e254c1029c30a265d6b52d28d7ec31fdd9acb9))

## [4.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/segment-metrics@3.0.2...@exodus/segment-metrics@4.0.0) (2024-08-16)

### ⚠ BREAKING CHANGES

- **segment-metrics:** Tracker requires apiBaseUrl to be provided (#8415)

### Features

- **segment-metrics:** Tracker requires apiBaseUrl to be provided ([#8415](https://github.com/ExodusMovement/exodus-hydra/issues/8415)) ([73a8d0a](https://github.com/ExodusMovement/exodus-hydra/commit/73a8d0a381a39fa3dddf976404f42b848404ff73))

## [3.0.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/segment-metrics@3.0.1...@exodus/segment-metrics@3.0.2) (2024-05-17)

### Bug Fixes

- **segment-metrics:** log event name ([#6978](https://github.com/ExodusMovement/exodus-hydra/issues/6978)) ([373716b](https://github.com/ExodusMovement/exodus-hydra/commit/373716b53be8ea9431dfe9103303acd286f7ec06))

## [3.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/segment-metrics@3.0.0...@exodus/segment-metrics@3.0.1) (2024-03-05)

### Bug Fixes

- **segment-metrics:** set error name as message in prod mode ([#5979](https://github.com/ExodusMovement/exodus-hydra/issues/5979)) ([798d24d](https://github.com/ExodusMovement/exodus-hydra/commit/798d24d68f9397fff8568b1fff582a066e929c9e))

## [3.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/segment-metrics@2.4.0...@exodus/segment-metrics@3.0.0) (2024-02-05)

### ⚠ BREAKING CHANGES

- **segment-metrics:** avoid side-effect and exposing internals (#5445)

### Features

- **segment-metrics:** avoid side-effect and exposing internals ([#5445](https://github.com/ExodusMovement/exodus-hydra/issues/5445)) ([2d74a4b](https://github.com/ExodusMovement/exodus-hydra/commit/2d74a4b5d47f9b702605d5ff7f8040e2a1988548))

### Bug Fixes

- **segment-metrics:** send error message to Mixpanel ([#5579](https://github.com/ExodusMovement/exodus-hydra/issues/5579)) ([7535ea2](https://github.com/ExodusMovement/exodus-hydra/commit/7535ea2cfd16d8a36bc284bbb8c9521cc7e7c466))

## [2.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/segment-metrics@2.3.2...@exodus/segment-metrics@2.4.0) (2024-01-16)

### Features

- **segment-metrics:** dev can log analytics event ([#5403](https://github.com/ExodusMovement/exodus-hydra/issues/5403)) ([9cbad92](https://github.com/ExodusMovement/exodus-hydra/commit/9cbad92b622bc5939b7c3344e405191dcaebca8f))

## [2.3.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/segment-metrics@2.3.1...@exodus/segment-metrics@2.3.2) (2024-01-12)

### Bug Fixes

- **segment-metrics:** publish utils ([#5381](https://github.com/ExodusMovement/exodus-hydra/issues/5381)) ([f2ab749](https://github.com/ExodusMovement/exodus-hydra/commit/f2ab749b6f16500781a7d500126072a6d1024c6d))

## [2.3.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/segment-metrics@2.3.0...@exodus/segment-metrics@2.3.1) (2024-01-12)

### Bug Fixes

- snake_case for numeric values ([#5375](https://github.com/ExodusMovement/exodus-hydra/issues/5375)) ([1688021](https://github.com/ExodusMovement/exodus-hydra/commit/1688021ce212b01dea9d2e7406d2d8564a39e412))

## [2.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/segment-metrics@2.2.2...@exodus/segment-metrics@2.3.0) (2023-12-07)

### Features

- add support for passing custom `fetch` to `segment-metrics` ([#4972](https://github.com/ExodusMovement/exodus-hydra/issues/4972)) ([1f55a04](https://github.com/ExodusMovement/exodus-hydra/commit/1f55a04f767f1a3a656903713632f1d1e09781e7))

## [2.2.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/segment-metrics@2.2.1...@exodus/segment-metrics@2.2.2) (2023-11-01)

**Note:** Version bump only for package @exodus/segment-metrics

## [2.2.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/segment-metrics@2.2.0...@exodus/segment-metrics@2.2.1) (2023-08-11)

### Bug Fixes

- omit undefined event properties ([#3316](https://github.com/ExodusMovement/exodus-hydra/issues/3316)) ([dcbab2b](https://github.com/ExodusMovement/exodus-hydra/commit/dcbab2b390292cedbf975878a18e24aa781ded96))

## [2.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/segment-metrics@2.1.1...@exodus/segment-metrics@2.2.0) (2023-07-10)

### Features

- log invalid events ([#2465](https://github.com/ExodusMovement/exodus-hydra/issues/2465)) ([5f2c7b8](https://github.com/ExodusMovement/exodus-hydra/commit/5f2c7b8e43fc3981a391e0fd845e1810e0d9b576))

## [2.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/segment-metrics@2.1.0...@exodus/segment-metrics@2.1.1) (2023-07-03)

### Bug Fixes

- **segment-metrics:** typo in API ([#2224](https://github.com/ExodusMovement/exodus-hydra/issues/2224)) ([5faa24e](https://github.com/ExodusMovement/exodus-hydra/commit/5faa24eac3246c88bc2a78faa3d13c29e94c530c))

## [2.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/segment-metrics@2.0.0...@exodus/segment-metrics@2.1.0) (2023-06-22)

### Features

- **segment-metrics:** send error in dev mode ([#1918](https://github.com/ExodusMovement/exodus-hydra/issues/1918)) ([982c2f1](https://github.com/ExodusMovement/exodus-hydra/commit/982c2f1204618c1f906818a73f47f8bd2c9980f7))

## [2.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/segment-metrics@1.6.0...@exodus/segment-metrics@2.0.0) (2023-06-12)

### ⚠ BREAKING CHANGES

- **segment-metrics:** remove setLogEvents (#1893)

### Bug Fixes

- **segment-metrics:** remove setLogEvents ([#1893](https://github.com/ExodusMovement/exodus-hydra/issues/1893)) ([bdf41e7](https://github.com/ExodusMovement/exodus-hydra/commit/bdf41e7a0b64883a224ce55cb5e9e42988204a67))

## 1.6.0 (2023-05-26)

### Features

- accept event timestamp on track ([#5](https://github.com/ExodusMovement/exodus-hydra/issues/5)) ([72bafb2](https://github.com/ExodusMovement/exodus-hydra/commit/72bafb2515a132668fc92b40b90c13d283cbedfb))
- add auto formatting, event logging, tests ([5e4de93](https://github.com/ExodusMovement/exodus-hydra/commit/5e4de935a240e9d0bc98dbc59fae82e84cfd8878))
- add logEvents option ([e86861f](https://github.com/ExodusMovement/exodus-hydra/commit/e86861f31d5806c1f25e6c6a432c7db6f62c081f))
- add validateEvent ([5728e11](https://github.com/ExodusMovement/exodus-hydra/commit/5728e1155ec885a28a05f11bc06da188f8d33132))
- adds the identify method ([#6](https://github.com/ExodusMovement/exodus-hydra/issues/6)) ([68c6e65](https://github.com/ExodusMovement/exodus-hydra/commit/68c6e65faf5220e0e75d92e6d096dc2c9eb85f0d))
- event as SanitizationError ([eb8f17d](https://github.com/ExodusMovement/exodus-hydra/commit/eb8f17d29db15995ac54beaa10f0676aa1b5d338))
- return the AnonymousId ([f5a3ca0](https://github.com/ExodusMovement/exodus-hydra/commit/f5a3ca0f0501613608771032e134220f4047ceb2))
- **segment-metrics:** allow setting default props for `SanitizationError` ([#1656](https://github.com/ExodusMovement/exodus-hydra/issues/1656)) ([00c075f](https://github.com/ExodusMovement/exodus-hydra/commit/00c075ffdc4f65b2f17cdd228cc4076d3866b8ca))
- set user id ([84183f9](https://github.com/ExodusMovement/exodus-hydra/commit/84183f945285e362cf17e412ff4519bc230d76ea))
- set user id on the identify function ([#15](https://github.com/ExodusMovement/exodus-hydra/issues/15)) ([2168cb6](https://github.com/ExodusMovement/exodus-hydra/commit/2168cb64648c1275e7eec5132182c8a2966a4a95))
- start using the segment proxy server ([d15bc9d](https://github.com/ExodusMovement/exodus-hydra/commit/d15bc9d02dc78ea2cfed023359229a12f35b6b60))
- throw error and log to segment ([3232288](https://github.com/ExodusMovement/exodus-hydra/commit/32322882844a46850d91d277517ef4b6133d8247))

### Bug Fixes

- add anonymousId to error msg ([e6ae99c](https://github.com/ExodusMovement/exodus-hydra/commit/e6ae99c23bd64b9f28ede37029a2ec6257502c3f))
- death to the try / catch ([ab82262](https://github.com/ExodusMovement/exodus-hydra/commit/ab82262840271fc56c3d738bba736ba1b46f25e3))
- ensure validateEvent is a function ([ccbfbad](https://github.com/ExodusMovement/exodus-hydra/commit/ccbfbad57e5eb5b07f1d38a1a7e924f2b17f19d4))
- invalid destructuring ([f7e1632](https://github.com/ExodusMovement/exodus-hydra/commit/f7e1632c90e96835f2b3dd8bed0dc0900a1a1386))
- lint index.js ([9a3bac8](https://github.com/ExodusMovement/exodus-hydra/commit/9a3bac86ebb060ca3e6700a44ae5cb8f0f32d5e4))
- lint jest.config.js ([3f33e43](https://github.com/ExodusMovement/exodus-hydra/commit/3f33e434c0f8566f785248904860d589fbc3a89b))
- lint tests ([34d9999](https://github.com/ExodusMovement/exodus-hydra/commit/34d999986a42e3485bad1cf88c978a8589cb9061))
- safely assign into object ([#4](https://github.com/ExodusMovement/exodus-hydra/issues/4)) ([eaceb29](https://github.com/ExodusMovement/exodus-hydra/commit/eaceb29a59510b815fd7126cc53b68c38e97eaf2))

### Reverts

- Revert "chore: bump version" ([80d1d2b](https://github.com/ExodusMovement/exodus-hydra/commit/80d1d2b81a7ca15309655ea1d6ca21e4c8d67c3d))
