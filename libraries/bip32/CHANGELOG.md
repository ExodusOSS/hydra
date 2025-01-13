# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.3.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/bip32@3.3.0...@exodus/bip32@3.3.1) (2024-10-11)

### Bug Fixes

- make chainCode getter use # ([#9917](https://github.com/ExodusMovement/exodus-hydra/issues/9917)) ([ddfa8f9](https://github.com/ExodusMovement/exodus-hydra/commit/ddfa8f9bb4bf43493e6edf7b71925c4695af434c))

## [3.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/bip32@3.2.0...@exodus/bip32@3.3.0) (2024-10-02)

### Features

- feat: merge hdkey into bip32 ([#9603](https://github.com/ExodusMovement/exodus-hydra/issues/9603)) ([f51d940](https://github.com/ExodusMovement/exodus-hydra/commit/f51d94030f7bebfd000bee76b3a32c57e28c18fb))

## [3.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/bip32@3.1.0...@exodus/bip32@3.2.0) (2024-10-01)

### Features

- create bip32 from public key and chaincode ([#9639](https://github.com/ExodusMovement/exodus-hydra/issues/9639)) ([1e6fa0c](https://github.com/ExodusMovement/exodus-hydra/commit/1e6fa0caf3ef773a597e9914956c8dba762fe2cc))

## [3.1.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/bip32@3.0.1...@exodus/bip32@3.1.0) (2024-07-17)

### Features

- expose hdkey fingerprint in BIP32 ([#1272](https://github.com/ExodusMovement/exodus-core/issues/1272)) ([2f1a6e2](https://github.com/ExodusMovement/exodus-core/commit/2f1a6e20b9cb79c228842b3af67289bb2e99f201))

## [3.0.1](https://github.com/ExodusMovement/exodus-core/compare/@exodus/bip32@3.0.0...@exodus/bip32@3.0.1) (2024-07-09)

### Bug Fixes

- use longer exclude pattern in files with a hope that it work ([#1255](https://github.com/ExodusMovement/exodus-core/issues/1255)) ([158d77b](https://github.com/ExodusMovement/exodus-core/commit/158d77b054aa4861d91b4fc58152efa9a6a85577))

## [3.0.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/bip32@2.1.1...@exodus/bip32@3.0.0) (2024-07-08)

### ⚠ BREAKING CHANGES

- convert exodus/bip32 from CJS to ESM (#1238)

### Features

- convert exodus/bip32 from CJS to ESM ([#1238](https://github.com/ExodusMovement/exodus-core/issues/1238)) ([dbebecf](https://github.com/ExodusMovement/exodus-core/commit/dbebecf1fc7a6db27814ad85c2808bf70a2ae8ce))

## [2.1.1](https://github.com/ExodusMovement/exodus-core/compare/@exodus/bip32@2.1.0...@exodus/bip32@2.1.1) (2024-02-16)

**Note:** Relicensed as MIT

# [2.1.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/bip32@2.0.0...@exodus/bip32@2.1.0) (2024-02-07)

### Features

- bip32 seed identifier ([#1041](https://github.com/ExodusMovement/exodus-core/issues/1041)) ([bfa6697](https://github.com/ExodusMovement/exodus-core/commit/bfa669798dc0d9e689265ba3ebb5330d34cb90e1))

# [2.0.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/bip32@1.1.2...@exodus/bip32@2.0.0) (2023-08-11)

### ⚠ BREAKING CHANGES

- **key-utils:** derivation path logic ([#926](https://github.com/ExodusMovement/exodus-core/issues/926)) ([22edf4e](https://github.com/ExodusMovement/exodus-core/commit/22edf4e2a8acd7ed2ef62b925f7ddf2d892aeab2))

### Features

- **bip32:** support Cardano purposes ([#862](https://github.com/ExodusMovement/exodus-core/issues/862)) ([fdb5663](https://github.com/ExodusMovement/exodus-core/commit/fdb566351fb898a2ca46e235da747ecff54e4480))

## [1.1.2](https://github.com/ExodusMovement/exodus-core/compare/@exodus/bip32@1.1.1...@exodus/bip32@1.1.2) (2023-02-22)

**Note:** Version bump only for package @exodus/bip32

## [1.1.1](https://github.com/ExodusMovement/exodus-core/compare/@exodus/bip32@1.1.0...@exodus/bip32@1.1.1) (2023-02-07)

**Note:** Version bump only for package @exodus/bip32

# 1.1.0 (2023-02-06)

### Features

- **bip32:** allow skipping slow public key verification ([#713](https://github.com/ExodusMovement/exodus-core/issues/713)) ([06ec628](https://github.com/ExodusMovement/exodus-core/commit/06ec62832d92fd9d64ad2fda8d75451b30d149bd))
- **bip32:** normalize derive() input type errors ([#576](https://github.com/ExodusMovement/exodus-core/issues/576)) ([0dc2aa6](https://github.com/ExodusMovement/exodus-core/commit/0dc2aa6278d165a90acd0b1bef25921b46f8857e))
- **keychain:** add slip10, bip32 modules ([#507](https://github.com/ExodusMovement/exodus-core/issues/507)) ([4822bba](https://github.com/ExodusMovement/exodus-core/commit/4822bba0368cd3457f79935581b4d677bbba5817))

## 1.0.0

Bump version to indicate production ready.

## 0.0.1

Initial shared bip32 module.
