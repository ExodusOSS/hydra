# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.3.1](https://github.com/ExodusMovement/hydra/compare/@exodus/fetch-factory@2.3.0...@exodus/fetch-factory@2.3.1) (2025-08-20)

### Bug Fixes

- fix: handle request object (#13627)

## [2.3.0](https://github.com/ExodusMovement/hydra/compare/@exodus/fetch-factory@2.2.6...@exodus/fetch-factory@2.3.0) (2025-05-23)

### Features

- feat: unset headers when they are null/undefined (#12651)

## [2.2.6](https://github.com/ExodusMovement/hydra/compare/@exodus/fetch-factory@2.2.5...@exodus/fetch-factory@2.2.6) (2025-03-07)

### Bug Fixes

- fix(fetch-factory): hostnameFromString validates extracted hostname (#11677)

## [2.2.5](https://github.com/ExodusMovement/hydra/compare/@exodus/fetch-factory@2.2.4...@exodus/fetch-factory@2.2.5) (2025-02-28)

### Performance

- perf: avoid URL construction for hostname (#11627)

## [2.2.4](https://github.com/ExodusMovement/hydra/compare/@exodus/fetch-factory@2.2.3...@exodus/fetch-factory@2.2.4) (2024-11-01)

Re-licensed under MIT license.

## [2.2.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fetch-factory@2.2.2...@exodus/fetch-factory@2.2.3) (2024-10-03)

### Bug Fixes

- use proper ESM in fetch-factory ([#9747](https://github.com/ExodusMovement/exodus-hydra/issues/9747)) ([7436c9a](https://github.com/ExodusMovement/exodus-hydra/commit/7436c9a770e022a4b9790057ee148ea4c4863a98))

## [2.2.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fetch-factory@2.2.1...@exodus/fetch-factory@2.2.2) (2024-09-25)

### Bug Fixes

- get correct hostname when using URL objects ([#9520](https://github.com/ExodusMovement/exodus-hydra/issues/9520)) ([816e6a7](https://github.com/ExodusMovement/exodus-hydra/commit/816e6a79fb65d3c58813fadb4c71b73f7eb1296f))

## [2.2.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fetch-factory@2.2.0...@exodus/fetch-factory@2.2.1) (2024-09-25)

### Performance Improvements

- exclude query params when parsing url for hostname ([#9464](https://github.com/ExodusMovement/exodus-hydra/issues/9464)) ([c49ca49](https://github.com/ExodusMovement/exodus-hydra/commit/c49ca49626eb8ab6975c8b19e466b7ca2971e8af))

## [2.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fetch-factory@2.1.1...@exodus/fetch-factory@2.2.0) (2024-07-02)

### Features

- update fetch-factory to address audit concerns ([#7566](https://github.com/ExodusMovement/exodus-hydra/issues/7566)) ([2528314](https://github.com/ExodusMovement/exodus-hydra/commit/252831400bd9f5717819200e36148dfac678716e))

## [2.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fetch-factory@2.1.0...@exodus/fetch-factory@2.1.1) (2024-06-28)

**Note:** Version bump only for package @exodus/fetch-factory

## [2.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fetch-factory@2.0.1...@exodus/fetch-factory@2.1.0) (2024-06-27)

### Features

- Update to consider fetch passing path instead of full url ([#7533](https://github.com/ExodusMovement/exodus-hydra/issues/7533)) ([b57d6c4](https://github.com/ExodusMovement/exodus-hydra/commit/b57d6c41c19b2d0062643dc09013bdea92eb2812))

## [2.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fetch-factory@1.0.0...@exodus/fetch-factory@2.0.1) (2024-06-24)

### ⚠ BREAKING CHANGES

- add header handling per domain (#7439)

### Features

- add header handling per domain ([#7439](https://github.com/ExodusMovement/exodus-hydra/issues/7439)) ([7c45192](https://github.com/ExodusMovement/exodus-hydra/commit/7c451924901bd118765bea8bc7e1bb6f8bf1b5f5))
