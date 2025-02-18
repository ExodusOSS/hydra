# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/find-optimistic-orders@3.0.0...@exodus/find-optimistic-orders@3.1.0) (2025-02-13)

### Features

- feat(find-optimistic-orders): use slippage in order to match order (#11449)

### License

- license: re-license under MIT license (#10580)

## [3.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/find-optimistic-orders@3.0.0...@exodus/find-optimistic-orders@3.0.1) (2024-11-25)

### License

- license: re-license under MIT license (#10580)

## 3.0.0 (2024-09-11)

### ⚠ BREAKING CHANGES

- bump assets-base dependencies to ESM / bigint (#1271)
- remove reliance on @exodus/assets from Tx (#592)

### Features

- bump assets-base dependencies to ESM / bigint ([#1271](https://github.com/ExodusMovement/exodus-hydra/issues/1271)) ([cba38c0](https://github.com/ExodusMovement/exodus-hydra/commit/cba38c098c39cc1848666809feb7af2eb0c4cf69))
- **find-optimistic-orders:** match toTxId with tx ([#591](https://github.com/ExodusMovement/exodus-hydra/issues/591)) ([1bcb38d](https://github.com/ExodusMovement/exodus-hydra/commit/1bcb38dc4746af1cc1c053d221a77394e8e36e3c))
- optimistically match EOS creation tx ([#379](https://github.com/ExodusMovement/exodus-hydra/issues/379)) ([fca759d](https://github.com/ExodusMovement/exodus-hydra/commit/fca759dfada1ae4f5cf41398f83b7baf82ecd5f9))
- remove types from find-optimistic-orders ([#957](https://github.com/ExodusMovement/exodus-hydra/issues/957)) ([6ab761f](https://github.com/ExodusMovement/exodus-hydra/commit/6ab761f8ecf6bcbf49c027601902ed0425a59fe8))

### Bug Fixes

- check that there are still received tx without match ([#381](https://github.com/ExodusMovement/exodus-hydra/issues/381)) ([a86641c](https://github.com/ExodusMovement/exodus-hydra/commit/a86641cb8d853c48deaae7e0dd5579ff0111a7bb))
- make package proper ESM ([#1219](https://github.com/ExodusMovement/exodus-hydra/issues/1219)) ([715bd78](https://github.com/ExodusMovement/exodus-hydra/commit/715bd7847c10d0be2ff0b659ee645aebfd6c1536))
- max EOS RAM cost ([#380](https://github.com/ExodusMovement/exodus-hydra/issues/380)) ([d4977d8](https://github.com/ExodusMovement/exodus-hydra/commit/d4977d8bc949ed511ee5dac8abeac3fa28a33ad4))
- remove `toNumberString` usage ([#445](https://github.com/ExodusMovement/exodus-hydra/issues/445)) ([9e7d4aa](https://github.com/ExodusMovement/exodus-hydra/commit/9e7d4aa4b1149ba7d63a25a4d7e9529320b095a1))
- satisfy lint ([988ea51](https://github.com/ExodusMovement/exodus-hydra/commit/988ea51247c8c12e0ca77a5464d74109a33ff488))

### Code Refactoring

- remove reliance on @exodus/assets from Tx ([#592](https://github.com/ExodusMovement/exodus-hydra/issues/592)) ([1c85503](https://github.com/ExodusMovement/exodus-hydra/commit/1c85503157c79b59f0fa462ec4bc57be0a8b281e))

## [2.0.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/find-optimistic-orders@1.1.1...@exodus/find-optimistic-orders@2.0.0) (2024-08-08)

### ⚠ BREAKING CHANGES

- bump assets-base dependencies to ESM / bigint (#1271)

### Features

- bump assets-base dependencies to ESM / bigint ([#1271](https://github.com/ExodusMovement/exodus-core/issues/1271)) ([7d4df69](https://github.com/ExodusMovement/exodus-core/commit/7d4df69a807e482ea39c9236c48bb39bfc730083))

## [1.1.1](https://github.com/ExodusMovement/exodus-core/compare/@exodus/find-optimistic-orders@1.1.0...@exodus/find-optimistic-orders@1.1.1) (2024-07-05)

### Bug Fixes

- make package proper ESM ([#1219](https://github.com/ExodusMovement/exodus-core/issues/1219)) ([1c42129](https://github.com/ExodusMovement/exodus-core/commit/1c42129b752d2fb8022ae1de9fb5618f58192bcf))

# 1.1.0 (2023-09-20)

### Features

- remove types from find-optimistic-orders ([#957](https://github.com/ExodusMovement/exodus-core/issues/957)) ([94d75d2](https://github.com/ExodusMovement/exodus-core/commit/94d75d20d613b65ad1b462721a8f66fd83cc5734))

## 1.0.4 / 2022-08-29

Optimize matching by checking order toTxId

## 1.0.3 / 2022-08-26

replace toNumberString usage https://github.com/ExodusMovement/exodus-core/pull/445
optimize array speed https://github.com/ExodusMovement/exodus-core/pull/382

## 1.0.2 / 2021-06-02

Handle EOS creation tx

## 1.0.1 / 2021-04-06

Simplify logic, add more tests

## 1.0.0 / 2021-04-06

Initial commit
