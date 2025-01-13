# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/tx-log-monitors@2.3.5...@exodus/tx-log-monitors@2.4.0) (2024-11-21)

### Features

- feat: add ability to ignore all sunset asset monitors (#8875)

- feat: use atoms v9 (#9651)

### Bug Fixes

- fix: provide walletAccount when calling getDefaultPathIndexes (#10347)

## [2.3.5](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/tx-log-monitors@2.3.4...@exodus/tx-log-monitors@2.3.5) (2024-09-12)

**Note:** Version bump only for package @exodus/tx-log-monitors

## [2.3.4](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/tx-log-monitors@2.3.3...@exodus/tx-log-monitors@2.3.4) (2024-09-11)

**Note:** Version bump only for package @exodus/tx-log-monitors

## [2.3.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/tx-log-monitors@2.3.2...@exodus/tx-log-monitors@2.3.3) (2024-09-09)

**Note:** Version bump only for package @exodus/tx-log-monitors

## [2.3.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/tx-log-monitors@2.3.1...@exodus/tx-log-monitors@2.3.2) (2024-07-25)

### Bug Fixes

- migrate definitions ([#8030](https://github.com/ExodusMovement/exodus-hydra/issues/8030)) ([d2dfde5](https://github.com/ExodusMovement/exodus-hydra/commit/d2dfde55dfa843eb52842f64b3aac3a6f9a59069))

## [2.3.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/tx-log-monitors@2.3.0...@exodus/tx-log-monitors@2.3.1) (2024-07-18)

**Note:** Version bump only for package @exodus/tx-log-monitors

## [2.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/tx-log-monitors@2.2.0...@exodus/tx-log-monitors@2.3.0) (2024-07-03)

### Features

- allow subscribing to when a new seed is done restoring ([#7565](https://github.com/ExodusMovement/exodus-hydra/issues/7565)) ([1c9464e](https://github.com/ExodusMovement/exodus-hydra/commit/1c9464e8a9e1aafb6a9ebb5e9567ab33de6f2e33))

## [2.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/tx-log-monitors@2.1.4...@exodus/tx-log-monitors@2.2.0) (2024-05-22)

### Features

- default feature config ([#5879](https://github.com/ExodusMovement/exodus-hydra/issues/5879)) ([b3f9c3b](https://github.com/ExodusMovement/exodus-hydra/commit/b3f9c3bfba3e3e059b3d189e17e82d6892da1301))

### Bug Fixes

- remove unnessory log ([#6831](https://github.com/ExodusMovement/exodus-hydra/issues/6831)) ([16872ca](https://github.com/ExodusMovement/exodus-hydra/commit/16872cad230d32916d25e92be00ab3b2de4cb0a8))

## [2.1.4](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/tx-log-monitors@2.1.2...@exodus/tx-log-monitors@2.1.4) (2024-03-14)

### Bug Fixes

- **txLogMonitors:** publish 2.1.3 ([#6086](https://github.com/ExodusMovement/exodus-hydra/issues/6086)) ([c54cf02](https://github.com/ExodusMovement/exodus-hydra/commit/c54cf025100b7ed8157806b9351a894d4ba17bde))

### Performance Improvements

- **txLogMonitors:** force tick to finish restore faster ([#5967](https://github.com/ExodusMovement/exodus-hydra/issues/5967)) ([84802cd](https://github.com/ExodusMovement/exodus-hydra/commit/84802cd720d09a980a48f7413842d798976841d3))

## [2.1.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/tx-log-monitors@2.1.1...@exodus/tx-log-monitors@2.1.2) (2024-03-03)

### Bug Fixes

- **tx-log-monitors:** missing process the event after-restore ([#5961](https://github.com/ExodusMovement/exodus-hydra/issues/5961)) ([d205ba1](https://github.com/ExodusMovement/exodus-hydra/commit/d205ba140f7a25cd31d85db4204c7cf85ff44c7f))

## [2.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/tx-log-monitors@2.1.0...@exodus/tx-log-monitors@2.1.1) (2024-02-26)

### Bug Fixes

- do a full refresh for newly available assets ([#5850](https://github.com/ExodusMovement/exodus-hydra/issues/5850)) ([33797fb](https://github.com/ExodusMovement/exodus-hydra/commit/33797fb8699c47ccd856cad11ab3fe5707d80ebb))

## [2.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/tx-log-monitors@2.0.1...@exodus/tx-log-monitors@2.1.0) (2024-02-15)

### Features

- prepare tx log monitors for mobile ([#5682](https://github.com/ExodusMovement/exodus-hydra/issues/5682)) ([aca8afd](https://github.com/ExodusMovement/exodus-hydra/commit/aca8afdc678f4bcee597db8b487a39b0f6654b7d))
- support for configuring what tokens to add ([#5674](https://github.com/ExodusMovement/exodus-hydra/issues/5674)) ([efb11de](https://github.com/ExodusMovement/exodus-hydra/commit/efb11de0ddb81f625c570a36a58ff30ead5c4933))
- tx log monitors plugin enhancement ([#5697](https://github.com/ExodusMovement/exodus-hydra/issues/5697)) ([a4b0f6b](https://github.com/ExodusMovement/exodus-hydra/commit/a4b0f6b4f6f316abe22d49b3af1a745324a02e9b))

## [2.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/tx-log-monitors@2.0.0...@exodus/tx-log-monitors@2.0.1) (2024-02-07)

### Bug Fixes

- add update() to txLogMonitors API ([#5631](https://github.com/ExodusMovement/exodus-hydra/issues/5631)) ([26a1dd3](https://github.com/ExodusMovement/exodus-hydra/commit/26a1dd32e86817c6d63fdc3af2aeb6ca6a420750))

## [2.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/tx-log-monitors@1.2.1...@exodus/tx-log-monitors@2.0.0) (2024-02-07)

### ⚠ BREAKING CHANGES

- tx log monitor enhancements (#5598)

### Features

- tx log monitor enhancements ([#5598](https://github.com/ExodusMovement/exodus-hydra/issues/5598)) ([279a3ea](https://github.com/ExodusMovement/exodus-hydra/commit/279a3ea720a5eb5c942d722247001d58edbe3e72))

### Bug Fixes

- missing dependencies ([#5322](https://github.com/ExodusMovement/exodus-hydra/issues/5322)) ([01efedc](https://github.com/ExodusMovement/exodus-hydra/commit/01efedc7508fb14925277fdcd388afb721ac3dd1))

## [1.2.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/tx-log-monitors@1.2.0...@exodus/tx-log-monitors@1.2.1) (2023-11-24)

### Bug Fixes

- cleanup subscriptions on stop ([#4814](https://github.com/ExodusMovement/exodus-hydra/issues/4814)) ([d053582](https://github.com/ExodusMovement/exodus-hydra/commit/d0535826c2023dd4d3273b367bbcc5cca6e4bb95))

## [1.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/tx-log-monitors@1.1.1...@exodus/tx-log-monitors@1.2.0) (2023-10-13)

### Features

- refresh monitor on available asset added ([#4400](https://github.com/ExodusMovement/exodus-hydra/issues/4400)) ([d912cde](https://github.com/ExodusMovement/exodus-hydra/commit/d912cde063e9b3ff674f378e80ee5edbc9f2abfb))

## [1.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/tx-log-monitors@1.1.0...@exodus/tx-log-monitors@1.1.1) (2023-10-04)

### Bug Fixes

- **tx-logs:** make monitors stop non-blocking in onLock hook ([#4327](https://github.com/ExodusMovement/exodus-hydra/issues/4327)) ([5ef5f15](https://github.com/ExodusMovement/exodus-hydra/commit/5ef5f151b2fe4ab84e290e17849986a74f8ea375))

## [1.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/tx-log-monitors@1.0.3...@exodus/tx-log-monitors@1.1.0) (2023-08-17)

### Features

- stop tx-log monitors ([#3400](https://github.com/ExodusMovement/exodus-hydra/issues/3400)) ([0e6498f](https://github.com/ExodusMovement/exodus-hydra/commit/0e6498fd45ea16460f599173fd362cd758360656))

## [1.0.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/tx-log-monitors@1.0.2...@exodus/tx-log-monitors@1.0.3) (2023-08-08)

### Bug Fixes

- emit baseAssetName from unknown-tokens event ([#3222](https://github.com/ExodusMovement/exodus-hydra/issues/3222)) ([b15c2a7](https://github.com/ExodusMovement/exodus-hydra/commit/b15c2a7198e2b79dd6d19e692ebfea58935ed0ff))

## [1.0.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/tx-log-monitors@1.0.1...@exodus/tx-log-monitors@1.0.2) (2023-08-08)

### Bug Fixes

- silent debug logger ([#3219](https://github.com/ExodusMovement/exodus-hydra/issues/3219)) ([d19d90b](https://github.com/ExodusMovement/exodus-hydra/commit/d19d90b7bd280ad204de88555b33360d22f362d8))

## [1.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/tx-log-monitors@1.0.0...@exodus/tx-log-monitors@1.0.1) (2023-08-08)

### Bug Fixes

- logger usage ([#3215](https://github.com/ExodusMovement/exodus-hydra/issues/3215)) ([9818797](https://github.com/ExodusMovement/exodus-hydra/commit/98187977b1a649628c3ef6338f8a671ab17806f6))

## 1.0.0 (2023-08-08)

### Features

- tx-log-monitors feature ([#3182](https://github.com/ExodusMovement/exodus-hydra/issues/3182)) ([7b096a7](https://github.com/ExodusMovement/exodus-hydra/commit/7b096a71fd75acb7d279d363d6751c9378310086))
