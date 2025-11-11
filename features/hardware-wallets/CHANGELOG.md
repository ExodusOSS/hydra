# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hardware-wallets@3.0.2...@exodus/hardware-wallets@3.1.0) (2025-10-01)

### Features

- feat(hardware-wallets): add baseAssetName to signRequest (#13962)

## [3.0.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hardware-wallets@3.0.1...@exodus/hardware-wallets@3.0.2) (2025-08-08)

### Bug Fixes

- fix(hardware-wallets): connected assets memoization by asset list (#13471)

## [3.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hardware-wallets@3.0.0...@exodus/hardware-wallets@3.0.1) (2025-06-17)

### Bug Fixes

- fix: retry logic on hardware signing (#12944)

## [3.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hardware-wallets@2.1.0...@exodus/hardware-wallets@3.0.0) (2025-06-16)

### ⚠ BREAKING CHANGES

- rework hardware wallet UI signing (#12852)

### Features

- feat!: rework hardware wallet UI signing (#12852)

## [2.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hardware-wallets@2.0.5...@exodus/hardware-wallets@2.1.0) (2025-05-13)

### Features

- feat(wallet-accounts): default ledger color and icon (#12426)

## [2.0.5](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hardware-wallets@2.0.4...@exodus/hardware-wallets@2.0.5) (2025-05-09)

### Bug Fixes

- fix(hardware-wallets): complete modal flow on user refusal action (#12056)

## [2.0.4](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hardware-wallets@2.0.3...@exodus/hardware-wallets@2.0.4) (2025-03-05)

### Bug Fixes

- fix: bump bip32 (#11415)

## [2.0.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hardware-wallets@2.0.2...@exodus/hardware-wallets@2.0.3) (2024-12-20)

### License

- license: re-license under MIT license (#10599)

## [2.0.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hardware-wallets@2.0.1...@exodus/hardware-wallets@2.0.2) (2024-12-05)

### Bug Fixes

- fix: memoize selector factory (#10593)

## [2.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hardware-wallets@2.0.0...@exodus/hardware-wallets@2.0.1) (2024-11-25)

### Bug Fixes

- fix: drop down the crypto package requirement (#10571)

## [2.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hardware-wallets@1.7.0...@exodus/hardware-wallets@2.0.0) (2024-11-18)

### ⚠ BREAKING CHANGES

- fix: use correct parameter name for publicKeyStore (#10460)

## [1.7.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hardware-wallets@1.6.0...@exodus/hardware-wallets@1.7.0) (2024-11-13)

### Features

- feat: add isAssetNameConnectedForWalletAccountSelector (#10416)

## [1.6.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hardware-wallets@1.5.1...@exodus/hardware-wallets@1.6.0) (2024-10-22)

### Features

- support cancelling an action on the ledger device ([#10105](https://github.com/ExodusMovement/exodus-hydra/issues/10105)) ([f1c1fbf](https://github.com/ExodusMovement/exodus-hydra/commit/f1c1fbff6ec70b7ddc68dd700ffb556b673b7a5a))

### Bug Fixes

- catch xpub key identifier errrors ([#10124](https://github.com/ExodusMovement/exodus-hydra/issues/10124)) ([7cd681d](https://github.com/ExodusMovement/exodus-hydra/commit/7cd681deec14adfa9c3e7613f276f2745f1df441))

## [1.5.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hardware-wallets@1.5.0...@exodus/hardware-wallets@1.5.1) (2024-10-17)

### Bug Fixes

- support cancelling transaction through ui ([#10058](https://github.com/ExodusMovement/exodus-hydra/issues/10058)) ([beb7d2d](https://github.com/ExodusMovement/exodus-hydra/commit/beb7d2d1aafba17678a34febcf2458163d9182d2))

## [1.5.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hardware-wallets@1.4.0...@exodus/hardware-wallets@1.5.0) (2024-10-17)

### Features

- add `getSelectedDevice` ([#9822](https://github.com/ExodusMovement/exodus-hydra/issues/9822)) ([2c18c22](https://github.com/ExodusMovement/exodus-hydra/commit/2c18c22d419ba9136cd8b264e946b151df438c59))
- support adding model to wallet account ([#9936](https://github.com/ExodusMovement/exodus-hydra/issues/9936)) ([8c858f6](https://github.com/ExodusMovement/exodus-hydra/commit/8c858f6e08e41bee3261f444c3d25e8bdd385014))

### Bug Fixes

- unify user refused error handling ([#10052](https://github.com/ExodusMovement/exodus-hydra/issues/10052)) ([db85d10](https://github.com/ExodusMovement/exodus-hydra/commit/db85d108333630d09bad545c5ec1169b937e08fe))

## [1.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hardware-wallets@1.3.0...@exodus/hardware-wallets@1.4.0) (2024-10-07)

### Features

- make hardware-wallets public ([#9811](https://github.com/ExodusMovement/exodus-hydra/issues/9811)) ([2c7e86d](https://github.com/ExodusMovement/exodus-hydra/commit/2c7e86d39d400da91f42ae57549cfca840d292ab))

## [1.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hardware-wallets@1.2.1...@exodus/hardware-wallets@1.3.0) (2024-09-19)

### Features

- add multisig support to hardware-wallets ([#9312](https://github.com/ExodusMovement/exodus-hydra/issues/9312)) ([62afbf1](https://github.com/ExodusMovement/exodus-hydra/commit/62afbf1fa0295e3267b807c38a756a9169fdd816))

## [1.2.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hardware-wallets@1.2.0...@exodus/hardware-wallets@1.2.1) (2024-09-13)

### Bug Fixes

- dont await sign transaction/message modal ([#9268](https://github.com/ExodusMovement/exodus-hydra/issues/9268)) ([c2e1de9](https://github.com/ExodusMovement/exodus-hydra/commit/c2e1de987c31b2277bcc3cf65d13e11758bd2110))

## [1.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hardware-wallets@1.1.2...@exodus/hardware-wallets@1.2.0) (2024-08-16)

### Features

- add getAvailableDevices ([#8474](https://github.com/ExodusMovement/exodus-hydra/issues/8474)) ([377ef0d](https://github.com/ExodusMovement/exodus-hydra/commit/377ef0d2c4e25ac33085c638ec7bbfe5dff74efd))

## [1.1.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hardware-wallets@1.1.1...@exodus/hardware-wallets@1.1.2) (2024-08-13)

### Bug Fixes

- add require device for ([#8333](https://github.com/ExodusMovement/exodus-hydra/issues/8333)) ([102f065](https://github.com/ExodusMovement/exodus-hydra/commit/102f065d66f00e0501986aeb53d90435f1e51adc))

## [1.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hardware-wallets@1.1.0...@exodus/hardware-wallets@1.1.1) (2024-08-12)

### Bug Fixes

- resolve circular dependency temporarily ([#8316](https://github.com/ExodusMovement/exodus-hydra/issues/8316)) ([c4e7570](https://github.com/ExodusMovement/exodus-hydra/commit/c4e75706c5f1e4e4be63d6c46dcaa5f30f71d124))

## [1.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hardware-wallets@1.0.0...@exodus/hardware-wallets@1.1.0) (2024-08-08)

### Features

- add scan device support ([#8249](https://github.com/ExodusMovement/exodus-hydra/issues/8249)) ([e6393bf](https://github.com/ExodusMovement/exodus-hydra/commit/e6393bf91235a9b0d719097d855e1808efc48a33))
