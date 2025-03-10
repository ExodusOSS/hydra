# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.5.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/application@2.4.0...@exodus/application@2.5.0) (2025-02-17)

### Features

- feat: application report (#11471)

## [2.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/application@2.3.0...@exodus/application@2.4.0) (2025-02-13)

### Features

- feat: catch error from restoreIfNeeded (#11433)

## [2.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/application@2.2.4...@exodus/application@2.3.0) (2025-02-12)

### Features

- feat: allow override the restore flag on start (#11423)

## [2.2.4](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/application@2.2.3...@exodus/application@2.2.4) (2025-01-31)

### Bug Fixes

- fix: restore edge case (#11296)

## [2.2.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/application@2.2.2...@exodus/application@2.2.3) (2024-12-13)

### Bug Fixes

- fix(application): remove duplicated observer (#10850)

## [2.2.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/application@2.2.0...@exodus/application@2.2.2) (2024-11-28)

### Bug Fixes

- fix: Skip local seed backup during passkey restore (#10560)

### License

- license: re-license under MIT license (#10580)

## [2.2.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/application@2.2.0...@exodus/application@2.2.1) (2024-11-25)

### License

- license: re-license under MIT license (#10580)

## [2.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/application@2.1.1...@exodus/application@2.2.0) (2024-10-11)

### Features

- use atoms v9 ([#9651](https://github.com/ExodusMovement/exodus-hydra/issues/9651)) ([524aa61](https://github.com/ExodusMovement/exodus-hydra/commit/524aa61f69c81e6ac00b2f94ea830688a105b3e4))

### Bug Fixes

- **application:** pass backupType to restore hook ([#9855](https://github.com/ExodusMovement/exodus-hydra/issues/9855)) ([a21d644](https://github.com/ExodusMovement/exodus-hydra/commit/a21d644309210099bcc81f21ef22716db9da3f39))

## [2.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/application@2.1.0...@exodus/application@2.1.1) (2024-09-23)

### Bug Fixes

- storage atom usage ([#9426](https://github.com/ExodusMovement/exodus-hydra/issues/9426)) ([9febd92](https://github.com/ExodusMovement/exodus-hydra/commit/9febd926e38869ae9391b0e1c3c89c6e0295ac70))

## [2.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/application@2.0.0...@exodus/application@2.1.0) (2024-09-12)

### Features

- **restore:** add backupType ([#9132](https://github.com/ExodusMovement/exodus-hydra/issues/9132)) ([2cddf42](https://github.com/ExodusMovement/exodus-hydra/commit/2cddf425bfef487169c219257202296f9c5aa6e1))

## [2.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/application@1.5.0...@exodus/application@2.0.0) (2024-08-22)

### ⚠ BREAKING CHANGES

- remove unused lockHistoryMaxEntries config from application (#8473)
- use dummy passphrase-cache if alarms or sessionStorage adapters are missing (#8238)

### Features

- **application:** accept lockHistoryMaxEntries config ([#8338](https://github.com/ExodusMovement/exodus-hydra/issues/8338)) ([04f5a02](https://github.com/ExodusMovement/exodus-hydra/commit/04f5a029e1bd2a9ff9953edad3b6c2735532f989))
- **application:** forward compatibilityMode to wallet when adding a seed ([#8572](https://github.com/ExodusMovement/exodus-hydra/issues/8572)) ([270a18f](https://github.com/ExodusMovement/exodus-hydra/commit/270a18f0db663ee8bb849abd6fc4e8e122a4cbad))
- remove unused lockHistoryMaxEntries config from application ([#8473](https://github.com/ExodusMovement/exodus-hydra/issues/8473)) ([fec9f55](https://github.com/ExodusMovement/exodus-hydra/commit/fec9f55c8bb1497de07298d2eb2931faab5d5f08))

### Bug Fixes

- use dummy passphrase-cache if alarms or sessionStorage adapters are missing ([#8238](https://github.com/ExodusMovement/exodus-hydra/issues/8238)) ([75fe20f](https://github.com/ExodusMovement/exodus-hydra/commit/75fe20ff230265264be0295ce30aa24db561278b))

## [1.5.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/application@1.4.1...@exodus/application@1.5.0) (2024-08-06)

### Features

- move passphrase-cache to application feature ([#8213](https://github.com/ExodusMovement/exodus-hydra/issues/8213)) ([8b6cbf0](https://github.com/ExodusMovement/exodus-hydra/commit/8b6cbf02089cf6183767061757190fe7fc396262))

## [1.4.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/application@1.4.0...@exodus/application@1.4.1) (2024-07-31)

### Bug Fixes

- **application:** ship redux entrypoint for legacy bundlers ([#8157](https://github.com/ExodusMovement/exodus-hydra/issues/8157)) ([b88b04d](https://github.com/ExodusMovement/exodus-hydra/commit/b88b04d0266b61c8e4183fddf5bcc1ab290b6793))

## [1.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/application@1.3.0...@exodus/application@1.4.0) (2024-07-30)

### Features

- **application:** redux module ([#8140](https://github.com/ExodusMovement/exodus-hydra/issues/8140)) ([b0cdfa3](https://github.com/ExodusMovement/exodus-hydra/commit/b0cdfa3a111b4445ecbe9c46497c77ab315ad2d3))

## [1.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/application@1.2.4...@exodus/application@1.3.0) (2024-07-29)

### Features

- **application:** make addSeed return the added seed id ([#8119](https://github.com/ExodusMovement/exodus-hydra/issues/8119)) ([6bb8360](https://github.com/ExodusMovement/exodus-hydra/commit/6bb836085a7c063a7a633f22e1b2a58fb69a4b4c))

## [1.2.4](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/application@1.2.3...@exodus/application@1.2.4) (2024-07-25)

### Bug Fixes

- migrate definitions ([#8030](https://github.com/ExodusMovement/exodus-hydra/issues/8030)) ([d2dfde5](https://github.com/ExodusMovement/exodus-hydra/commit/d2dfde55dfa843eb52842f64b3aac3a6f9a59069))

## [1.2.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/application@1.2.2...@exodus/application@1.2.3) (2024-07-18)

**Note:** Version bump only for package @exodus/application

## [1.2.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/application@1.2.1...@exodus/application@1.2.2) (2024-07-12)

### Bug Fixes

- remove import params flag after import ([#7805](https://github.com/ExodusMovement/exodus-hydra/issues/7805)) ([cd18fba](https://github.com/ExodusMovement/exodus-hydra/commit/cd18fbab3f5c6af60db76643994b22dbe8d92f92))

## [1.2.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/application@1.2.0...@exodus/application@1.2.1) (2024-07-04)

### Bug Fixes

- onAddSeed usage ([#7639](https://github.com/ExodusMovement/exodus-hydra/issues/7639)) ([3d14297](https://github.com/ExodusMovement/exodus-hydra/commit/3d14297e7909056c23e36fe976c14e300098caa5))

## [1.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/application@1.1.0...@exodus/application@1.2.0) (2024-07-03)

### Features

- allow subscribing to when a new seed is done restoring ([#7565](https://github.com/ExodusMovement/exodus-hydra/issues/7565)) ([1c9464e](https://github.com/ExodusMovement/exodus-hydra/commit/1c9464e8a9e1aafb6a9ebb5e9567ab33de6f2e33))

## [1.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/application@1.0.1...@exodus/application@1.1.0) (2024-06-19)

### Features

- allow removing seeds ([#7437](https://github.com/ExodusMovement/exodus-hydra/issues/7437)) ([44842a8](https://github.com/ExodusMovement/exodus-hydra/commit/44842a874dc2958a38ba28ccf79219d7b8450bf9))

## [1.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/application@1.0.0...@exodus/application@1.0.1) (2024-06-12)

### Bug Fixes

- don't sepcify \_logger, it can override the superclass one ([#7352](https://github.com/ExodusMovement/exodus-hydra/issues/7352)) ([567a42e](https://github.com/ExodusMovement/exodus-hydra/commit/567a42ec9f7f5d18352346357cac400dd533be46))
