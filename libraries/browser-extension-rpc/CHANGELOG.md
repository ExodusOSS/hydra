# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/browser-extension-rpc@3.0.2...@exodus/browser-extension-rpc@4.0.0) (2025-01-29)

### ⚠ BREAKING CHANGES

- remove RPC and client (#11128)

- refactor!: remove RPC and client (#11128)

## [3.0.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/browser-extension-rpc@3.0.1...@exodus/browser-extension-rpc@3.0.2) (2025-01-17)

### Bug Fixes

- fix: make sure reserved methods are passed through (#11122)

## [3.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/browser-extension-rpc@3.0.0...@exodus/browser-extension-rpc@3.0.1) (2024-12-20)

### License

- license: re-license under MIT license (#10599)

## [3.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/browser-extension-rpc@2.1.3...@exodus/browser-extension-rpc@3.0.0) (2024-12-04)

### ⚠ BREAKING CHANGES

- allow exposing further RPC methods in a separate call (#10699)

### Features

- feat!: allow exposing further RPC methods in a separate call (#10699)

## 2.1.3 (2024-11-18)

### Bug Fixes

- fix: return fn in get proxy trap if prop is function (#10455)

## [2.1.2](https://github.com/ExodusMovement/browser-extension-base/compare/@exodus/browser-extension-rpc@2.1.1...@exodus/browser-extension-rpc@2.1.2) (2024-08-23)

### Bug Fixes

- refactor use eventemitter3 instead of undeclared events dep ([#74](https://github.com/ExodusMovement/browser-extension-base/issues/74)) ([4d160bc](https://github.com/ExodusMovement/browser-extension-base/commit/4d160bc709019926e819eb4bf7dbeecdd1dbbd5e))
- **rpc:** avoid creating different proxies for same property ([#77](https://github.com/ExodusMovement/browser-extension-base/issues/77)) ([de8d63d](https://github.com/ExodusMovement/browser-extension-base/commit/de8d63db80b553e5dda49c105020aaeb4e1a7fe0))

## [2.1.1](https://github.com/ExodusMovement/browser-extension-base/compare/@exodus/browser-extension-rpc@2.1.0...@exodus/browser-extension-rpc@2.1.1) (2024-07-17)

### Bug Fixes

- deserialize events coming over transport ([#68](https://github.com/ExodusMovement/browser-extension-base/issues/68)) ([41734d4](https://github.com/ExodusMovement/browser-extension-base/commit/41734d486bb8ed47acc5e2501ddeaa7fb8758cc5))

## [2.1.0](https://github.com/ExodusMovement/browser-extension-base/compare/@exodus/browser-extension-rpc@2.0.5...@exodus/browser-extension-rpc@2.1.0) (2024-07-12)

### Features

- export RPC and client factory ([#66](https://github.com/ExodusMovement/browser-extension-base/issues/66)) ([a2b480e](https://github.com/ExodusMovement/browser-extension-base/commit/a2b480eff341af115176cb7ae60ebe94dc10f8eb))

## [2.0.5](https://github.com/ExodusMovement/browser-extension-base/compare/@exodus/browser-extension-rpc@2.0.4...@exodus/browser-extension-rpc@2.0.5) (2024-06-27)

### Bug Fixes

- define sub-exports ([#64](https://github.com/ExodusMovement/browser-extension-base/issues/64)) ([0f08aca](https://github.com/ExodusMovement/browser-extension-base/commit/0f08aca9cc48fbe94e4b8660709e5291765c14de))

## [2.0.4](https://github.com/ExodusMovement/browser-extension-base/compare/@exodus/browser-extension-rpc@2.0.3...@exodus/browser-extension-rpc@2.0.4) (2024-06-27)

### Bug Fixes

- omit primitives when flattening api methods ([#60](https://github.com/ExodusMovement/browser-extension-base/issues/60)) ([fd4005f](https://github.com/ExodusMovement/browser-extension-base/commit/fd4005fced70e4457aba131d61227ff37dca0217))

## [2.0.3](https://github.com/ExodusMovement/browser-extension-base/compare/@exodus/browser-extension-rpc@2.0.2...@exodus/browser-extension-rpc@2.0.3) (2024-04-25)

**Note:** Version bump only for package @exodus/browser-extension-rpc

## [2.0.2](https://github.com/ExodusMovement/browser-extension-base/compare/@exodus/browser-extension-rpc@2.0.1...@exodus/browser-extension-rpc@2.0.2) (2024-04-24)

**Note:** Version bump only for package @exodus/browser-extension-rpc

## [2.0.1](https://github.com/ExodusMovement/browser-extension-base/compare/@exodus/browser-extension-rpc@2.0.0...@exodus/browser-extension-rpc@2.0.1) (2023-10-19)

**Note:** Version bump only for package @exodus/browser-extension-rpc

## [2.0.0](https://github.com/ExodusMovement/browser-extension-base/compare/@exodus/browser-extension-rpc@1.4.0...@exodus/browser-extension-rpc@2.0.0) (2023-10-16)

### ⚠ BREAKING CHANGES

- **rpc:** prevent multiple extensions from using the same RPC transport (#37)

### Bug Fixes

- **rpc:** prevent multiple extensions from using the same RPC transport ([#37](https://github.com/ExodusMovement/browser-extension-base/issues/37)) ([85ce152](https://github.com/ExodusMovement/browser-extension-base/commit/85ce152f2b9396be9844a52405551c2afe14d1d2))

## [1.4.0](https://github.com/ExodusMovement/browser-extension-base/compare/@exodus/browser-extension-rpc@1.3.1...@exodus/browser-extension-rpc@1.4.0) (2023-08-07)

### Features

- allow rpc manager to check if rpc exists by tab id ([#33](https://github.com/ExodusMovement/browser-extension-base/issues/33)) ([ae8dd46](https://github.com/ExodusMovement/browser-extension-base/commit/ae8dd46b893029f3bebc31ded4d5f03952c828a0))

## [1.3.1](https://github.com/ExodusMovement/browser-extension-base/compare/@exodus/browser-extension-rpc@1.3.0...@exodus/browser-extension-rpc@1.3.1) (2023-07-07)

### Bug Fixes

- add missing import ([#30](https://github.com/ExodusMovement/browser-extension-base/issues/30)) ([8e577b8](https://github.com/ExodusMovement/browser-extension-base/commit/8e577b84a13078fdfa0d45f7096e8715dd181eae))

## [1.3.0](https://github.com/ExodusMovement/browser-extension-base/compare/@exodus/browser-extension-rpc@1.2.0...@exodus/browser-extension-rpc@1.3.0) (2023-07-07)

### Features

- add site metadata in content rpc proxy ([#29](https://github.com/ExodusMovement/browser-extension-base/issues/29)) ([764fc19](https://github.com/ExodusMovement/browser-extension-base/commit/764fc19dda626545d380a6ed2cd1c1483333f585))

## [1.2.0](https://github.com/ExodusMovement/browser-extension-base/compare/@exodus/browser-extension-rpc@1.1.0...@exodus/browser-extension-rpc@1.2.0) (2023-07-07)

### Features

- add channels and content proxy ([#28](https://github.com/ExodusMovement/browser-extension-base/issues/28)) ([ae23749](https://github.com/ExodusMovement/browser-extension-base/commit/ae2374948950a2428b66cd09d8674666ae12fa6f))

## 1.1.0 (2023-06-22)

### Features

- add adapters package ([#26](https://github.com/ExodusMovement/browser-extension-base/issues/26)) ([35cfb7a](https://github.com/ExodusMovement/browser-extension-base/commit/35cfb7a2048a2371b08f9347ca02cdc2b1bd493f))
