# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.2.5](https://github.com/ExodusMovement/exodus/compare/@exodus/bip322-js@3.2.4...@exodus/bip322-js@3.2.5) (2026-11-03)

### Bug Fixes

- **bip322-js:** recover BIP-137 signer from compact signature only ([#47529](https://github.com/ExodusMovement/exodus/issues/47529)) ([10bb6d0](https://github.com/ExodusMovement/exodus/commit/10bb6d0e9eadc6e6e9e78975774cae32adc15866))
- **siwx,bip322-js:** use @exodus/bytes instead of bs58 and wif ([#48254](https://github.com/ExodusMovement/exodus/issues/48254)) ([e12b855](https://github.com/ExodusMovement/exodus/commit/e12b85531d1c8a4c699b7e8c440182caa054542f))

## [3.2.4](https://github.com/ExodusMovement/exodus/compare/@exodus/bip322-js@3.2.3...@exodus/bip322-js@3.2.4) (2026-10-27)

### Bug Fixes

- **bip322-js:** construct virtual to_spend without a PSBT ([#47893](https://github.com/ExodusMovement/exodus/issues/47893)) ([2867c8e](https://github.com/ExodusMovement/exodus/commit/2867c8ecc9a3bda16d0a9d0a8545668e8b79b94a))

## [3.2.3](https://github.com/ExodusMovement/exodus/compare/@exodus/bip322-js@3.2.2...@exodus/bip322-js@3.2.3) (2026-10-09)

**Note:** Version bump only for package @exodus/bip322-js

## [3.2.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/bip322-js@3.2.1...@exodus/bip322-js@3.2.2) (2026-06-29)

### Bug Fixes

- **bip322-js:** BIP137 segwit-flag signature verification ([#16085](https://github.com/ExodusMovement/exodus-hydra/issues/16085)) ([9363135](https://github.com/ExodusMovement/exodus-hydra/commit/9363135c13cef1a7b632d133adddb4fde8a28f04))

## [3.2.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/bip322-js@3.2.0...@exodus/bip322-js@3.2.1) (2026-04-22)

### Bug Fixes

- fix(bip322-js): reject oversized DER R/S lengths (ECDSA malleability) (#16083)

## [3.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/bip322-js@3.1.0...@exodus/bip322-js@3.2.0) (2025-12-26)

### Features

- feat(bip322-js): export Verifier for BIP-322 signature verification (#14641)

## [3.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/bip322-js@3.0.0...@exodus/bip322-js@3.1.0) (2025-09-16)

### Features

- feat: update bip322-js and bitcoinjs (#13812)

## [3.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/bip322-js@2.2.0...@exodus/bip322-js@3.0.0) (2025-09-10)

### ⚠ BREAKING CHANGES

- drop sign() in favor of signAsync() (#13794)

### Features

- feat!: drop sign() in favor of signAsync() (#13794)

## [2.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/bip322-js@2.1.0...@exodus/bip322-js@2.2.0) (2025-09-09)

### Features

- feat: do not use ECPair from bitcoinjs (#13791)

## [2.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/bip322-js@2.0.2...@exodus/bip322-js@2.1.0) (2025-04-01)

### Features

- feat: support async signing with external signer (#11913)

## [2.0.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/bip322-js@2.0.1...@exodus/bip322-js@2.0.2) (2025-01-07)

**Note:** Version bump only for package @exodus/bip322-js

## [2.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/bip322-js@2.0.0...@exodus/bip322-js@2.0.1) (2025-01-05)

**Note:** Version bump only for package @exodus/bip322-js

## [2.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/bip322-js@1.2.1...@exodus/bip322-js@2.0.0) (2024-10-29)

### ⚠ BREAKING CHANGES

- drop unused exports from bip322 (#10142)

### Features

- **bip322-js:** use exodus/crypto for crypto primitives ([#10172](https://github.com/ExodusMovement/exodus-hydra/issues/10172)) ([f16b453](https://github.com/ExodusMovement/exodus-hydra/commit/f16b45339620de7460fd5c29c0942c4e7bfd7492))
- drop unused exports from bip322 ([#10142](https://github.com/ExodusMovement/exodus-hydra/issues/10142)) ([6c1a268](https://github.com/ExodusMovement/exodus-hydra/commit/6c1a2687130bdf88ff78c38a599c950c84ae8f60))

## [1.2.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/bip322-js@1.2.0...@exodus/bip322-js@1.2.1) (2024-10-22)

**Note:** Version bump only for package @exodus/bip322-js

## [1.1.0-rc.0](https://github.com/ExodusMovement/exodus-hydra.git/compare/@exodus/bip322-js@1.1.0-exodus.6...@exodus/bip322-js@1.1.0-rc.0) (2024-10-11)

**Note:** Version bump only for package @exodus/bip322-js

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Current]

### Changed

- Bumped `@exodus/bitcoinjs-lib` fork
- Removed ecc initialization of `@exodus/bitcoinjs-lib`

## [1.1.0-exodus.6] - 2024-07-22

### Changed

- Swap out with `@exodus/bitcoinjs-lib` fork
- Swap out with `@exodus/secp256k1` fork

## [1.1.0-exodus.4] - 2023-10-31

### Changed

- Sign with `SIGHASH_DEFAULT` instead of `SIGHASH_ALL` for non-spec compliant compatibility.

## [1.1.0] - 2023-08-20

### Added

- Added support for BIP-137 legacy signature verification against P2SH-P2WPKH, P2WPKH, and single-key-spend P2TR addresses.

## [1.0.3] - 2023-06-29

### Fixed

- Fixed ECC library uninitialized error during taproot signature verification.

## [1.0.2] - 2023-06-28

Initial release.

### Added

- Generate raw toSpend and toSign BIP-322 transactions via the BIP322 class.
- Sign a BIP-322 signature using a private key via the Signer class.
- Verify a simple BIP-322 signature via the Verifier class.
