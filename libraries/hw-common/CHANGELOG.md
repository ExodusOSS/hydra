# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-common@3.0.0...@exodus/hw-common@3.1.0) (2024-10-22)

### Features

- support cancelling an action on the ledger device ([#10105](https://github.com/ExodusMovement/exodus-hydra/issues/10105)) ([f1c1fbf](https://github.com/ExodusMovement/exodus-hydra/commit/f1c1fbff6ec70b7ddc68dd700ffb556b673b7a5a))

## [3.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-common@2.5.1...@exodus/hw-common@3.0.0) (2024-10-17)

### ⚠ BREAKING CHANGES

- remove `getFirstDevice` from hardware wallet discovery (#9821)

### Features

- add support for hardware wallet metadata on asset ([#9497](https://github.com/ExodusMovement/exodus-hydra/issues/9497)) ([8e8b0d1](https://github.com/ExodusMovement/exodus-hydra/commit/8e8b0d1fd945a93a8a37993dfceec7adb9a7a506))
- remove `getFirstDevice` from hardware wallet discovery ([#9821](https://github.com/ExodusMovement/exodus-hydra/issues/9821)) ([ad3e902](https://github.com/ExodusMovement/exodus-hydra/commit/ad3e902fd9e27dfccd8311089b6d966767cc6d0a))
- support adding model to wallet account ([#9936](https://github.com/ExodusMovement/exodus-hydra/issues/9936)) ([8c858f6](https://github.com/ExodusMovement/exodus-hydra/commit/8c858f6e08e41bee3261f444c3d25e8bdd385014))

### Bug Fixes

- unify user refused error handling ([#10052](https://github.com/ExodusMovement/exodus-hydra/issues/10052)) ([db85d10](https://github.com/ExodusMovement/exodus-hydra/commit/db85d108333630d09bad545c5ec1169b937e08fe))

## [2.5.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-common@2.5.0...@exodus/hw-common@2.5.1) (2024-10-09)

**Note:** Version bump only for package @exodus/hw-common

## [2.4.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-common@2.4.0...@exodus/hw-common@2.4.1) (2024-10-01)

### Features

- use internal xpub for multisig hardware wallet policy ([#9639](https://github.com/ExodusMovement/exodus-hydra/issues/9639)) ([e96bee0](https://github.com/ExodusMovement/exodus-hydra/commit/e96bee045b3799a43464db4487d42a980ef95f0f))

## [2.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-common@2.3.0...@exodus/hw-common@2.4.0) (2024-09-16)

### Features

- add bitcoin multisig support to ledger ([#9218](https://github.com/ExodusMovement/exodus-hydra/issues/9218)) ([1b63e8a](https://github.com/ExodusMovement/exodus-hydra/commit/1b63e8a6ac7bab9cd580f602f2fd0cbff48ed01c))

## [2.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-common@2.2.1...@exodus/hw-common@2.3.0) (2024-08-08)

### Features

- add scan device support ([#8249](https://github.com/ExodusMovement/exodus-hydra/issues/8249)) ([e6393bf](https://github.com/ExodusMovement/exodus-hydra/commit/e6393bf91235a9b0d719097d855e1808efc48a33))

## [2.2.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-common@2.2.0...@exodus/hw-common@2.2.1) (2024-08-02)

### Bug Fixes

- update common hardware types ([#8184](https://github.com/ExodusMovement/exodus-hydra/issues/8184)) ([65d256c](https://github.com/ExodusMovement/exodus-hydra/commit/65d256cb91944f4972ece5d2c0afc5df6dac2b83))

## [2.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-common@2.1.0...@exodus/hw-common@2.2.0) (2024-07-05)

### Features

- label 2 more packages as type=module ([#7642](https://github.com/ExodusMovement/exodus-hydra/issues/7642)) ([3072942](https://github.com/ExodusMovement/exodus-hydra/commit/3072942bf6881dcf76660cdf53c4c7a07ca4e73f))

## [2.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-common@2.0.0...@exodus/hw-common@2.1.0) (2024-07-03)

### Features

- **ledger:** support retrieving name & model ([#7597](https://github.com/ExodusMovement/exodus-hydra/issues/7597)) ([a3210d7](https://github.com/ExodusMovement/exodus-hydra/commit/a3210d7db77b44119bca90b6e7d4507e4012b4cf))

## [2.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-common@1.2.1...@exodus/hw-common@2.0.0) (2023-12-19)

### ⚠ BREAKING CHANGES

- simplify transaction signing api for ledger (#4979)

### Features

- simplify transaction signing api for ledger ([#4979](https://github.com/ExodusMovement/exodus-hydra/issues/4979)) ([30b1d45](https://github.com/ExodusMovement/exodus-hydra/commit/30b1d45602614c8b37cff926acaf830142fbf197))

## [1.2.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-common@1.2.0...@exodus/hw-common@1.2.1) (2023-11-28)

### Bug Fixes

- `HardwareWalletDevice` generic type passing to the parent interface ([#4908](https://github.com/ExodusMovement/exodus-hydra/issues/4908)) ([07ab24f](https://github.com/ExodusMovement/exodus-hydra/commit/07ab24fd17673590e82807804f1a636ec8b27c7b))

## [1.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-common@1.1.0...@exodus/hw-common@1.2.0) (2023-11-28)

### Features

- add ability to retrieve supported, installed and useable assets ([#4901](https://github.com/ExodusMovement/exodus-hydra/issues/4901)) ([d821590](https://github.com/ExodusMovement/exodus-hydra/commit/d82159062aa497c1ae5bbe4362cce8a2aff0cc9c))
- add generic `Message` type in `SignMessageParams` ([#4895](https://github.com/ExodusMovement/exodus-hydra/issues/4895)) ([fb688ea](https://github.com/ExodusMovement/exodus-hydra/commit/fb688ea071c18a1a041bbd53869f7afdce2c0b1d))
- add ledger `getFirstDevice` helper ([#4897](https://github.com/ExodusMovement/exodus-hydra/issues/4897)) ([6a2b362](https://github.com/ExodusMovement/exodus-hydra/commit/6a2b362e69b46e0d19be80394ff6f5533f6139ba))

## [1.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-common@1.0.0...@exodus/hw-common@1.1.0) (2023-11-27)

### Features

- **hw-ledger:** add ethereum transaction signing ([#2315](https://github.com/ExodusMovement/exodus-hydra/issues/2315)) ([5b5c60e](https://github.com/ExodusMovement/exodus-hydra/commit/5b5c60e950948d24cea672e37dc171e1d7348343))
- **hw-ledger:** ethereum message signing ([#3058](https://github.com/ExodusMovement/exodus-hydra/issues/3058)) ([df07d2d](https://github.com/ExodusMovement/exodus-hydra/commit/df07d2d861cc20c1db366b47dc98802dd8e73f9c))
