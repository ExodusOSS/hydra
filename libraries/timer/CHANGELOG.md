# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.2.1](https://github.com/ExodusMovement/hydra/compare/@exodus/timer@1.2.0...@exodus/timer@1.2.1) (2024-11-01)

Re-licensed under MIT license.

## [1.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/timer@@exodus/asset-websocket-api@3.5.4...@exodus/timer@1.2.0) (2024-09-27)

### Features

- migrate timer package ([#655](https://github.com/ExodusMovement/exodus-hydra/issues/655)) ([4a583e6](https://github.com/ExodusMovement/exodus-hydra/commit/4a583e6b8597a86c59f4736b29ca16ec7e17ec0c))

### Bug Fixes

- make package proper ESM ([#1219](https://github.com/ExodusMovement/exodus-hydra/issues/1219)) ([b5357a2](https://github.com/ExodusMovement/exodus-hydra/commit/b5357a291730dfb2629461ba2f8df99590938685))
- prevent unhandled exception ([#8853](https://github.com/ExodusMovement/exodus-hydra/issues/8853)) ([6ea18dc](https://github.com/ExodusMovement/exodus-hydra/commit/6ea18dcb285ae9bfc6efb55af434655ee77bface))
- **timers:** do not restart stopped timers from setNewInterval() ([#1302](https://github.com/ExodusMovement/exodus-hydra/issues/1302)) ([a5d2068](https://github.com/ExodusMovement/exodus-hydra/commit/a5d2068c4c45d6a51074265b2a40fe0410bec36f))
- **timers:** setNewInterval lifecycle fixes ([#1295](https://github.com/ExodusMovement/exodus-hydra/issues/1295)) ([7580976](https://github.com/ExodusMovement/exodus-hydra/commit/75809763c2b70cb605655cdc03502394f183adfa))

## [1.1.2](https://github.com/ExodusMovement/exodus-core/compare/@exodus/timer@1.1.1...@exodus/timer@1.1.2) (2024-08-09)

### Bug Fixes

- **timers:** do not restart stopped timers from setNewInterval() ([#1302](https://github.com/ExodusMovement/exodus-core/issues/1302)) ([cf96ede](https://github.com/ExodusMovement/exodus-core/commit/cf96ede34603ecd3a31954116b6eab3aca060d86))

## [1.1.1](https://github.com/ExodusMovement/exodus-core/compare/@exodus/timer@1.1.0...@exodus/timer@1.1.1) (2024-08-09)

### Bug Fixes

- **timers:** setNewInterval lifecycle fixes ([#1295](https://github.com/ExodusMovement/exodus-core/issues/1295)) ([9b843ff](https://github.com/ExodusMovement/exodus-core/commit/9b843ffdb8da9ff31f65e72e6f12c53351fb1cab))

## 1.1.0 (2024-07-05)

### Features

- forward time when resuming timers ([#86](https://github.com/ExodusMovement/exodus-core/issues/86)) ([a02bdcd](https://github.com/ExodusMovement/exodus-core/commit/a02bdcd646d3dacabafe27821a5a4aeeffcb6110))
- migrate timer package ([#655](https://github.com/ExodusMovement/exodus-core/issues/655)) ([131e4ae](https://github.com/ExodusMovement/exodus-core/commit/131e4ae85b99cea3946a63a26da5ac0138e8e31f))

### Bug Fixes

- make package proper ESM ([#1219](https://github.com/ExodusMovement/exodus-core/issues/1219)) ([1c42129](https://github.com/ExodusMovement/exodus-core/commit/1c42129b752d2fb8022ae1de9fb5618f58192bcf))
- prevent new ticks from paused timers ([#88](https://github.com/ExodusMovement/exodus-core/issues/88)) ([1511ad9](https://github.com/ExodusMovement/exodus-core/commit/1511ad9f6ade9c19f642367bb4d7d09f4ea8ba06))
