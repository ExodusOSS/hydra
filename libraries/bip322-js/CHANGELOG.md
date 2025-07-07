# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
