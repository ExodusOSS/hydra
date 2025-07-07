# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.7.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/key-utils@3.7.1...@exodus/key-utils@3.7.2) (2025-03-10)

### Bug Fixes

- fix: don't import bip32 for hardened offset (#11707)

## [3.7.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/key-utils@3.7.0...@exodus/key-utils@3.7.1) (2025-03-05)

### Bug Fixes

- fix: bump bip32 (#11415)

## 3.7.0 (2024-10-03)

### Features

- update bip32 in key-utils ([#1162](https://github.com/ExodusMovement/exodus-hydra/issues/9602)) ([5d4a2cb](https://github.com/ExodusMovement/exodus-hydra/commit/5d4a2cb2b1ecc96f4246f9bdaca488cf09d8733d))

## [3.6.1](https://github.com/ExodusMovement/exodus-core/compare/@exodus/key-utils@3.6.0...@exodus/key-utils@3.6.1) (2024-07-31)

### Bug Fixes

- `Symbol.toStringTag` usage in DerivationPath ([#1290](https://github.com/ExodusMovement/exodus-core/issues/1290)) ([99c4757](https://github.com/ExodusMovement/exodus-core/commit/99c4757808c4bc987d294f9baffa4c9dd82b49a4))

## [3.6.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/key-utils@3.5.1...@exodus/key-utils@3.6.0) (2024-07-31)

### Features

- add method to get path index ([#1291](https://github.com/ExodusMovement/exodus-core/issues/1291)) ([77f1fb6](https://github.com/ExodusMovement/exodus-core/commit/77f1fb615f8d31901eec8396ad031e405863b239))

## [3.5.1](https://github.com/ExodusMovement/exodus-core/compare/@exodus/key-utils@3.5.0...@exodus/key-utils@3.5.1) (2024-07-05)

### Bug Fixes

- make key-utils a proper ESM package ([#1214](https://github.com/ExodusMovement/exodus-core/issues/1214)) ([53ecfdf](https://github.com/ExodusMovement/exodus-core/commit/53ecfdf7d9f6041ddb8d82d088552125131d3ab4))

## [3.5.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/key-utils@3.4.0...@exodus/key-utils@3.5.0) (2024-07-04)

### Features

- add `replaceAtIndex` ([#1211](https://github.com/ExodusMovement/exodus-core/issues/1211)) ([015309f](https://github.com/ExodusMovement/exodus-core/commit/015309fb8b9cd9b9f934dd0486a77c7d744d819b))

## [3.4.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/key-utils@3.3.0...@exodus/key-utils@3.4.0) (2024-06-04)

### Features

- parse full address paths in parseDerivationPath ([#1192](https://github.com/ExodusMovement/exodus-core/issues/1192)) ([a60f288](https://github.com/ExodusMovement/exodus-core/commit/a60f28811c3e8cb223beadf00e2e190c6ad5ffa0))

## [3.3.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/key-utils@3.2.1...@exodus/key-utils@3.3.0) (2024-05-07)

### Features

- add `DerivationPath` class ([#1162](https://github.com/ExodusMovement/exodus-core/issues/1162)) ([74f2b77](https://github.com/ExodusMovement/exodus-core/commit/74f2b77e18781fffbf1ba0a541db31578308079d))

## [3.2.1](https://github.com/ExodusMovement/exodus-core/compare/@exodus/key-utils@3.2.0...@exodus/key-utils@3.2.1) (2024-04-09)

### Bug Fixes

- default allowXPUB to true for bip32 + secp256k1 ([#1143](https://github.com/ExodusMovement/exodus-core/issues/1143)) ([f717af5](https://github.com/ExodusMovement/exodus-core/commit/f717af582c4e3f0b54bd32ebe74fab8ed24d7391))

# [3.2.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/key-utils@3.1.0...@exodus/key-utils@3.2.0) (2024-02-27)

### Features

- add `getSeedId` ([#1096](https://github.com/ExodusMovement/exodus-core/issues/1096)) ([f59ecf4](https://github.com/ExodusMovement/exodus-core/commit/f59ecf4bca74265bab0f93191bf22d04e7f1af90))

# [3.1.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/key-utils@3.0.0...@exodus/key-utils@3.1.0) (2023-08-23)

### Features

- **key-utils:** add xpub & multi address support ([#936](https://github.com/ExodusMovement/exodus-core/issues/936)) ([b06bf9a](https://github.com/ExodusMovement/exodus-core/commit/b06bf9afa2c2aaf9b261893d34c4ddaf243d5db0))

## [3.0.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/key-utils@2.0.0...@exodus/key-utils@3.0.0) (2023-08-11)

### ⚠ BREAKING CHANGES

- feat(key-utils)!: derivation path logic ([#926](https://github.com/ExodusMovement/exodus-core/issues/926)) ([22edf4e](https://github.com/ExodusMovement/exodus-core/commit/22edf4e2a8acd7ed2ef62b925f7ddf2d892aeab2))

## [2.0.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/key-utils@1.0.1...@exodus/key-utils@2.0.0) (2023-07-19)

**Note:** Version bump only for package @exodus/key-utils

## [1.0.1](https://github.com/ExodusMovement/exodus-core/compare/@exodus/key-utils@1.0.0...@exodus/key-utils@1.0.1) (2023-07-18)

### Bug Fixes

- allow trezor compat mode ([#899](https://github.com/ExodusMovement/exodus-core/issues/899)) ([7ab4dbe](https://github.com/ExodusMovement/exodus-core/commit/7ab4dbeb3c14f7e9750520c75457b066d4e006e5))
