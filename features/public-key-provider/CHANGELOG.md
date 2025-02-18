# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/public-key-provider@4.0.2...@exodus/public-key-provider@4.1.0) (2025-01-15)

### Features

- feat: implement storing public keys in batches (#10975)

### Bug Fixes

- fix: race condition when mocking multiple xpubs (#11042)

## [4.0.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/public-key-provider@4.0.1...@exodus/public-key-provider@4.0.2) (2024-12-06)

### License

- license: re-license under MIT license (#10355)

## [4.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/public-key-provider@4.0.0...@exodus/public-key-provider@4.0.1) (2024-12-05)

**Note:** Version bump only for package @exodus/public-key-provider

## [4.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/public-key-provider@3.0.0...@exodus/public-key-provider@4.0.0) (2024-11-07)

### ⚠ BREAKING CHANGES

- cache software wallet public keys upon read (#9769)

### Features

- cache software wallet public keys upon read ([#9769](https://github.com/ExodusMovement/exodus-hydra/issues/9769)) ([c91911f](https://github.com/ExodusMovement/exodus-hydra/commit/c91911ff58ac14f43d8cf1577d7b0bf78fd50755))
- implement MockablePublicKeysProvider ([#9770](https://github.com/ExodusMovement/exodus-hydra/issues/9770)) ([40de1e1](https://github.com/ExodusMovement/exodus-hydra/commit/40de1e1fb8b758f7c1239db71d1dceb0078c5d30))
- prefer cached public keys for software wallets in dev mode ([#9757](https://github.com/ExodusMovement/exodus-hydra/issues/9757)) ([e292bde](https://github.com/ExodusMovement/exodus-hydra/commit/e292bde09f094dc5f95ced2ab03cbd2374049e79))

### Bug Fixes

- drop legacy storage format assertion ([#10004](https://github.com/ExodusMovement/exodus-hydra/issues/10004)) ([755cb08](https://github.com/ExodusMovement/exodus-hydra/commit/755cb08029484b46c3a32d119026efe36a84f2bf))
- provide walletAccount when calling getDefaultPathIndexes ([#10347](https://github.com/ExodusMovement/exodus-hydra/issues/10347)) ([d4407c5](https://github.com/ExodusMovement/exodus-hydra/commit/d4407c5e4d9ff34cc8beb762b25ad9e7c00a0baa))

## [3.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/public-key-provider@2.5.0...@exodus/public-key-provider@3.0.0) (2024-10-03)

### ⚠ BREAKING CHANGES

- ship `publicKeyStore` with `publicKeyProvider` feature (#9353)

### Features

- ship `publicKeyStore` with `publicKeyProvider` feature ([#9353](https://github.com/ExodusMovement/exodus-hydra/issues/9353)) ([0430a74](https://github.com/ExodusMovement/exodus-hydra/commit/0430a740152811dd3953163b4552a7a46d28d0dd))
- update bip32 to 3.3.0 ([#9721](https://github.com/ExodusMovement/exodus-hydra/issues/9721)) ([eb08369](https://github.com/ExodusMovement/exodus-hydra/commit/eb08369df93ed7239cb106e095b143da0032e174))

## [2.5.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/public-key-provider@2.4.1...@exodus/public-key-provider@2.5.0) (2024-08-19)

### Features

- switch public-key-provider to ESM ([#8508](https://github.com/ExodusMovement/exodus-hydra/issues/8508)) ([6352c99](https://github.com/ExodusMovement/exodus-hydra/commit/6352c99ba4aed7454b66ee30e7c1720d66fe7d3d))
- switch public-key-provider to exodus-test ([#8502](https://github.com/ExodusMovement/exodus-hydra/issues/8502)) ([fe65fb5](https://github.com/ExodusMovement/exodus-hydra/commit/fe65fb56dcc17055e7d617c74052a4d809fdf985))

## [2.4.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/public-key-provider@2.4.0...@exodus/public-key-provider@2.4.1) (2024-07-25)

### Bug Fixes

- migrate definitions ([#8030](https://github.com/ExodusMovement/exodus-hydra/issues/8030)) ([d2dfde5](https://github.com/ExodusMovement/exodus-hydra/commit/d2dfde55dfa843eb52842f64b3aac3a6f9a59069))

## [2.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/public-key-provider@2.3.1...@exodus/public-key-provider@2.4.0) (2024-07-19)

### Features

- tsdoc comments and union parameters ([#7924](https://github.com/ExodusMovement/exodus-hydra/issues/7924)) ([f345dcb](https://github.com/ExodusMovement/exodus-hydra/commit/f345dcb76bd7f21dead40afd5a34813e7ee6b999))
- use `[@sample](https://github.com/sample)` tag to render placeholder ([#7925](https://github.com/ExodusMovement/exodus-hydra/issues/7925)) ([6c41458](https://github.com/ExodusMovement/exodus-hydra/commit/6c41458e5fd1e26f7bbac9a73525f766283dbbd6))

## [2.3.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/public-key-provider@2.3.0...@exodus/public-key-provider@2.3.1) (2024-07-16)

### Bug Fixes

- use key identifier with enumerable derivation path ([#7854](https://github.com/ExodusMovement/exodus-hydra/issues/7854)) ([afd9653](https://github.com/ExodusMovement/exodus-hydra/commit/afd96533198a870568a83c4ecf03ead17d7797c1))

## [2.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/public-key-provider@2.2.2...@exodus/public-key-provider@2.3.0) (2024-07-09)

### Features

- get public key without keyIdentifier ([#7715](https://github.com/ExodusMovement/exodus-hydra/issues/7715)) ([7ebf379](https://github.com/ExodusMovement/exodus-hydra/commit/7ebf3794142a1d426e80498b3a5f6b914add4794))

## [2.2.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/public-key-provider@2.2.1...@exodus/public-key-provider@2.2.2) (2024-05-02)

### Bug Fixes

- getPublicKey walletAccount param type ([#6781](https://github.com/ExodusMovement/exodus-hydra/issues/6781)) ([01122e2](https://github.com/ExodusMovement/exodus-hydra/commit/01122e2f5ec0f4499f17071969ee9d4aee8f4b25))

## [2.2.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/public-key-provider@2.2.0...@exodus/public-key-provider@2.2.1) (2024-04-30)

### Bug Fixes

- add missing dependency ([#6743](https://github.com/ExodusMovement/exodus-hydra/issues/6743)) ([34e3864](https://github.com/ExodusMovement/exodus-hydra/commit/34e386484f031e205f22cab85e6a78491049cd0f))

## [2.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/public-key-provider@2.1.1...@exodus/public-key-provider@2.2.0) (2024-04-30)

### Features

- accept wallet account name ([#6732](https://github.com/ExodusMovement/exodus-hydra/issues/6732)) ([d1b441b](https://github.com/ExodusMovement/exodus-hydra/commit/d1b441b78e446f5215d22bce46dd55d882dfbe5a))

## [2.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/public-key-provider@2.1.0...@exodus/public-key-provider@2.1.1) (2024-04-26)

**Note:** Version bump only for package @exodus/public-key-provider

## [2.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/public-key-provider@2.0.1...@exodus/public-key-provider@2.1.0) (2024-04-24)

### Features

- publicKeyProvider.getExtendedPublicKey ([#6615](https://github.com/ExodusMovement/exodus-hydra/issues/6615)) ([7c02195](https://github.com/ExodusMovement/exodus-hydra/commit/7c02195ca63c03ab3b4a4ae7b2576dafbd633337))
- type headless api ([#6583](https://github.com/ExodusMovement/exodus-hydra/issues/6583)) ([0a6d67f](https://github.com/ExodusMovement/exodus-hydra/commit/0a6d67fee1a0f115fb72e1f57c6ee5068d8f7345))

## [2.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/public-key-provider@2.0.0...@exodus/public-key-provider@2.0.1) (2024-04-17)

### Bug Fixes

- make publicKeyStore optional ([#6543](https://github.com/ExodusMovement/exodus-hydra/issues/6543)) ([499bf5c](https://github.com/ExodusMovement/exodus-hydra/commit/499bf5cc0ed7043ed46d4960631a82033c9b41fc))
- use import file extensions in ESM ([#5786](https://github.com/ExodusMovement/exodus-hydra/issues/5786)) ([6855a76](https://github.com/ExodusMovement/exodus-hydra/commit/6855a769c661df5d3ce4b7823b9c5caff136e2a6))

## [2.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/public-key-provider@1.0.2...@exodus/public-key-provider@2.0.0) (2024-02-20)

### ⚠ BREAKING CHANGES

- support public keys from multiple seeds (#5771)

### Features

- support public keys from multiple seeds ([#5771](https://github.com/ExodusMovement/exodus-hydra/issues/5771)) ([63466cd](https://github.com/ExodusMovement/exodus-hydra/commit/63466cd105cbb652d383ede7fe14e9dff5240d3f))

## [1.0.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/public-key-provider@1.0.1...@exodus/public-key-provider@1.0.2) (2024-02-13)

### Bug Fixes

- use null prototype object ([#5693](https://github.com/ExodusMovement/exodus-hydra/issues/5693)) ([774f444](https://github.com/ExodusMovement/exodus-hydra/commit/774f44421014a3f30ceecde3c2f25fa510fe2fe2))

## [1.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/public-key-provider@1.0.0...@exodus/public-key-provider@1.0.1) (2024-02-09)

### Bug Fixes

- always wrap in key identifier ([#5666](https://github.com/ExodusMovement/exodus-hydra/issues/5666)) ([188dea2](https://github.com/ExodusMovement/exodus-hydra/commit/188dea2777d5f465b633687b6e90198abfc57493))
