# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/remote-config@3.0.0...@exodus/remote-config@3.0.1) (2025-06-09)

### Bug Fixes

- fix: don't use npm: aliases for lodash (#12861)

- fix: unbreak remote-config stop timer (#12465)

## [3.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/remote-config@2.10.0...@exodus/remote-config@3.0.0) (2025-04-09)

### ⚠ BREAKING CHANGES

- track errors with `errorTracking` module (#11966)

### Features

- feat: add schema for `remote-config` report node (#11961)

- feat!: track errors with `errorTracking` module (#11966)

## [2.10.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/remote-config@2.9.3...@exodus/remote-config@2.10.0) (2025-02-26)

### Features

- feat: report git hash (#11614)

## [2.9.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/remote-config@2.9.2...@exodus/remote-config@2.9.3) (2025-02-21)

### Bug Fixes

- fix: skip exporting most reports if wallet doesn't exist (#11553)

## [2.9.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/remote-config@2.9.1...@exodus/remote-config@2.9.2) (2025-02-17)

**Note:** Version bump only for package @exodus/remote-config

## [2.9.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/remote-config@2.9.0...@exodus/remote-config@2.9.1) (2025-02-14)

**Note:** Version bump only for package @exodus/remote-config

## [2.9.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/remote-config@2.8.0...@exodus/remote-config@2.9.0) (2025-01-16)

### Features

- feat: add update method to remote config api (#11119)

## [2.8.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/remote-config@2.7.2...@exodus/remote-config@2.8.0) (2024-12-06)

### Features

- feat: use atoms v9 (#9651)

### Bug Fixes

- fix: prefer Object.create(null) to {} (#10511)

### License

- license: re-license under MIT license (#10355)

## [2.7.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/remote-config@2.7.1...@exodus/remote-config@2.7.2) (2024-09-09)

**Note:** Version bump only for package @exodus/remote-config

## [2.7.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/remote-config@2.7.0...@exodus/remote-config@2.7.1) (2024-09-06)

### Bug Fixes

- drop networking-common from remote-config ([#8918](https://github.com/ExodusMovement/exodus-hydra/issues/8918)) ([7c18dc1](https://github.com/ExodusMovement/exodus-hydra/commit/7c18dc1112861470f9d2789fc61fdf1c9087908f))

## [2.7.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/remote-config@2.6.0...@exodus/remote-config@2.7.0) (2024-08-13)

### Features

- **remote-config:** pass config ([#8343](https://github.com/ExodusMovement/exodus-hydra/issues/8343)) ([923838f](https://github.com/ExodusMovement/exodus-hydra/commit/923838f547b8d4b92fa2103067e75bb056f9e80f))

## [2.6.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/remote-config@2.5.2...@exodus/remote-config@2.6.0) (2024-07-25)

### Features

- **remote-config:** add remoteConfigUrl to remote-config node report ([#8039](https://github.com/ExodusMovement/exodus-hydra/issues/8039)) ([8885d57](https://github.com/ExodusMovement/exodus-hydra/commit/8885d572d851299cf9076f9ba3846fb24eb0e9e0))

## [2.5.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/remote-config@2.5.1...@exodus/remote-config@2.5.2) (2024-07-25)

### Bug Fixes

- migrate definitions ([#8030](https://github.com/ExodusMovement/exodus-hydra/issues/8030)) ([d2dfde5](https://github.com/ExodusMovement/exodus-hydra/commit/d2dfde55dfa843eb52842f64b3aac3a6f9a59069))

## [2.5.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/remote-config@2.5.0...@exodus/remote-config@2.5.1) (2024-07-18)

**Note:** Version bump only for package @exodus/remote-config

## [2.5.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/remote-config@2.4.0...@exodus/remote-config@2.5.0) (2024-07-17)

### Features

- **remote-config:** adds remote config report node ([#7732](https://github.com/ExodusMovement/exodus-hydra/issues/7732)) ([936b7ae](https://github.com/ExodusMovement/exodus-hydra/commit/936b7ae5fe979636ffdd00610e6d31258cbb54eb))
- **remote-config:** to make remoteConfigUrl config optional ([#7872](https://github.com/ExodusMovement/exodus-hydra/issues/7872)) ([b701ebd](https://github.com/ExodusMovement/exodus-hydra/commit/b701ebddeaba5c8f4f3fabd86d4dc1cfbc8ca381))

## [2.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/remote-config@2.3.0...@exodus/remote-config@2.4.0) (2024-04-23)

### Features

- type remaining API methods shipped with headless ([#6619](https://github.com/ExodusMovement/exodus-hydra/issues/6619)) ([d1ec08e](https://github.com/ExodusMovement/exodus-hydra/commit/d1ec08e695f0df2c9e63b01169c746ef872fe541))

## [2.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/remote-config@2.2.0...@exodus/remote-config@2.3.0) (2023-10-16)

### Features

- use HEAD to check for changes ([#4430](https://github.com/ExodusMovement/exodus-hydra/issues/4430)) ([092ca58](https://github.com/ExodusMovement/exodus-hydra/commit/092ca58199a0b246cb643cfbb76e465670dc5857))

## [2.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/remote-config@2.1.1...@exodus/remote-config@2.2.0) (2023-10-04)

### Features

- **remote-config:** redux module ([#4319](https://github.com/ExodusMovement/exodus-hydra/issues/4319)) ([883954a](https://github.com/ExodusMovement/exodus-hydra/commit/883954ad80acd1b01183a848963c6d0181e66bb7))

## [2.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/remote-config@2.1.0...@exodus/remote-config@2.1.1) (2023-09-07)

### Bug Fixes

- **remote-config:** move typescript to dev dependency ([#3894](https://github.com/ExodusMovement/exodus-hydra/issues/3894)) ([ddf4371](https://github.com/ExodusMovement/exodus-hydra/commit/ddf43710122a44b457fd85cdcdff41b2fbfa4cfc))

## [2.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/remote-config@2.0.0...@exodus/remote-config@2.1.0) (2023-08-11)

### Features

- sync remote-config on load ([#3030](https://github.com/ExodusMovement/exodus-hydra/issues/3030)) ([105fd7e](https://github.com/ExodusMovement/exodus-hydra/commit/105fd7e6de7942df8c5da304bfbee64cab48fdd7))

### Bug Fixes

- stop ongoing operations in plugin ([#3252](https://github.com/ExodusMovement/exodus-hydra/issues/3252)) ([e9084e6](https://github.com/ExodusMovement/exodus-hydra/commit/e9084e6480bc86b521b5828a703b0919b2b7abc2))

## 2.0.0 (2023-07-25)

### ⚠ BREAKING CHANGES

- remote-config feature (#2899)

### Features

- remote-config feature ([#2899](https://github.com/ExodusMovement/exodus-hydra/issues/2899)) ([fcbe873](https://github.com/ExodusMovement/exodus-hydra/commit/fcbe87358e6258205ce969336ec4ab19e62f3270))
- remote-config module ([#2888](https://github.com/ExodusMovement/exodus-hydra/issues/2888)) ([8056a8b](https://github.com/ExodusMovement/exodus-hydra/commit/8056a8bc4f6ac05b107077a6668f2bc3f2a3824f))

### Bug Fixes

- remote-config packaged files whitelist ([#2903](https://github.com/ExodusMovement/exodus-hydra/issues/2903)) ([e0ad4ba](https://github.com/ExodusMovement/exodus-hydra/commit/e0ad4ba59dc162071a037113345a44878d084fdb))

## 1.1.0 (2023-07-25)

### Features

- remote-config module ([#2888](https://github.com/ExodusMovement/exodus-hydra/issues/2888)) ([8056a8b](https://github.com/ExodusMovement/exodus-hydra/commit/8056a8bc4f6ac05b107077a6668f2bc3f2a3824f))
