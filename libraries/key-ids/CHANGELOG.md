# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.1.1](https://github.com/ExodusMovement/exodus/compare/@exodus/key-ids@2.1.0...@exodus/key-ids@2.1.1) (2026-10-13)

**Note:** Version bump only for package @exodus/key-ids

## [2.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/key-ids@2.0.0...@exodus/key-ids@2.1.0) (2026-07-17)

### ⚠ BREAKING CHANGES

- **eslint-config-exodus:** @exodus/eslint-config-exodus no longer enforces
  no-floating-promises or no-unnecessary-condition and no longer sets
  parserOptions.project. Consumers relying on these without oxlint
  --type-aware lose the coverage; adopt oxlint type-aware.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>

- chore: drop redundant local no-floating-promises disable

@exodus/eslint-config-exodus no longer enables no-floating-promises, so

### Features

- add gift card feature ([#17567](https://github.com/ExodusMovement/exodus-hydra/issues/17567)) ([f0417f6](https://github.com/ExodusMovement/exodus-hydra/commit/f0417f66fafe6c7dfb1889dc9aaa0b6a23256b02))
- **eslint-config-exodus:** retire type-aware eslint rules, drop parserOptions.project ([#17273](https://github.com/ExodusMovement/exodus-hydra/issues/17273)) ([622ec93](https://github.com/ExodusMovement/exodus-hydra/commit/622ec935f14f0b7d54ee6f2b034995606383397c)), closes [#7693](https://github.com/ExodusMovement/exodus-hydra/issues/7693) [#17253](https://github.com/ExodusMovement/exodus-hydra/issues/17253)

## [2.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/key-ids@1.6.0...@exodus/key-ids@2.0.0) (2026-06-03)

### ⚠ BREAKING CHANGES

- remove multi-seed support from wallet/keychain (#16379)

### Features

- **key-ids:** convert to TypeScript ([#16644](https://github.com/ExodusMovement/exodus-hydra/issues/16644)) ([b488935](https://github.com/ExodusMovement/exodus-hydra/commit/b488935593cd2f07452e4857223f8aa841d44428))

### Code Refactoring

- remove multi-seed support from wallet/keychain ([#16379](https://github.com/ExodusMovement/exodus-hydra/issues/16379)) ([e63510f](https://github.com/ExodusMovement/exodus-hydra/commit/e63510f2b57b7bcb7704d993baf2e75d11edb3ad))

## [1.6.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/key-ids@1.5.0...@exodus/key-ids@1.6.0) (2026-01-26)

### Features

- feat: remove Buffer usage in key-ids (#15015)

## [1.5.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/key-ids@1.4.0...@exodus/key-ids@1.5.0) (2025-11-04)

### Features

- feat(key-ids): PAY key id (#14308)

## [1.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/key-ids@1.3.0...@exodus/key-ids@1.4.0) (2025-07-31)

### Features

- feat: support chat key id (#13410)

## [1.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/key-ids@1.2.3...@exodus/key-ids@1.3.0) (2025-03-31)

### Features

- feat: make 2 modules proper ESM, disable --esbuild (#8367)

### License

- license: re-license under MIT license (#11907)

## [1.2.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/key-ids@1.2.2...@exodus/key-ids@1.2.3) (2024-07-16)

### Bug Fixes

- use key identifier with enumerable derivation path ([#7854](https://github.com/ExodusMovement/exodus-hydra/issues/7854)) ([afd9653](https://github.com/ExodusMovement/exodus-hydra/commit/afd96533198a870568a83c4ecf03ead17d7797c1))

## [1.2.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/key-ids@1.2.1...@exodus/key-ids@1.2.2) (2024-03-02)

### Bug Fixes

- path reuse in key-ids ([#5916](https://github.com/ExodusMovement/exodus-hydra/issues/5916)) ([0f9b933](https://github.com/ExodusMovement/exodus-hydra/commit/0f9b933dadee5c5932253e1bf94b46e3e1a21303))

## [1.2.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/key-ids@1.2.0...@exodus/key-ids@1.2.1) (2024-03-01)

**Note:** Version bump only for package @exodus/key-ids

## [1.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/key-ids@1.1.1...@exodus/key-ids@1.2.0) (2024-02-15)

### Features

- EXTRA_SEEDS_ENCRYPTION ([#5722](https://github.com/ExodusMovement/exodus-hydra/issues/5722)) ([7d06011](https://github.com/ExodusMovement/exodus-hydra/commit/7d060113f0eb37c60c5cf4bc96100c79b3262bd6))

## [1.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/key-ids@1.1.0...@exodus/key-ids@1.1.1) (2024-02-15)

### Bug Fixes

- harden security against prototype pollution ([#5720](https://github.com/ExodusMovement/exodus-hydra/issues/5720)) ([b7b5476](https://github.com/ExodusMovement/exodus-hydra/commit/b7b54766db511f0e15ef7d2834c2ac12148094b9))

## [1.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/key-ids@1.0.0...@exodus/key-ids@1.1.0) (2024-02-13)

### Features

- add option to generate deterministic key pair ([#5688](https://github.com/ExodusMovement/exodus-hydra/issues/5688)) ([f337380](https://github.com/ExodusMovement/exodus-hydra/commit/f337380b9f0aca4f420d085a8f27f0b8169214e5))
