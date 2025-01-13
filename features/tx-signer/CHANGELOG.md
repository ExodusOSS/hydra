# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.9.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/tx-signer@2.9.1...@exodus/tx-signer@2.9.2) (2024-12-06)

### Bug Fixes

- fix: allow longer messages for 'schnorrZ' signature type (#10744)

## [2.9.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/tx-signer@2.9.0...@exodus/tx-signer@2.9.1) (2024-12-05)

**Note:** Version bump only for package @exodus/tx-signer

## [2.9.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/tx-signer@2.8.2...@exodus/tx-signer@2.9.0) (2024-12-04)

### Features

- feat: add support for Zilliqa schnorr signatures (#10588)

## [2.8.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/tx-signer@2.8.1...@exodus/tx-signer@2.8.2) (2024-11-21)

### Bug Fixes

- fix: provide walletAccount when calling getDefaultPathIndexes (#10347)

## [2.8.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/tx-signer@2.8.0...@exodus/tx-signer@2.8.1) (2024-10-29)

### Bug Fixes

- pass extraEntropy to secp256k1.signBuffer ([#10160](https://github.com/ExodusMovement/exodus-hydra/issues/10160)) ([3d77fd8](https://github.com/ExodusMovement/exodus-hydra/commit/3d77fd8c402101a5b9db2342c987ca243b06d722))

## [2.8.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/tx-signer@2.7.0...@exodus/tx-signer@2.8.0) (2024-09-25)

### Features

- validate 'data' arg to signer ([#9447](https://github.com/ExodusMovement/exodus-hydra/issues/9447)) ([2230091](https://github.com/ExodusMovement/exodus-hydra/commit/22300912a9463d21e94d273db0b5e676a8d872f5))

## [2.7.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/tx-signer@2.6.0...@exodus/tx-signer@2.7.0) (2024-09-18)

### Features

- support wallet account names in tx-signer API ([#9336](https://github.com/ExodusMovement/exodus-hydra/issues/9336)) ([17b0d02](https://github.com/ExodusMovement/exodus-hydra/commit/17b0d023d92977865e42b4a546400bb891c30f1d))

## [2.6.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/tx-signer@2.5.0...@exodus/tx-signer@2.6.0) (2024-09-16)

### Features

- support signing over RPC ([#9276](https://github.com/ExodusMovement/exodus-hydra/issues/9276)) ([3ac1d33](https://github.com/ExodusMovement/exodus-hydra/commit/3ac1d338ab9351e37588e1c2b3769384961f8f01))

## [2.5.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/tx-signer@2.4.1...@exodus/tx-signer@2.5.0) (2024-08-22)

### Features

- make tx-signer valid esm ([#8630](https://github.com/ExodusMovement/exodus-hydra/issues/8630)) ([7db1a17](https://github.com/ExodusMovement/exodus-hydra/commit/7db1a17a0760202916d4dd12f271ec9e860bbd32))

## [2.4.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/tx-signer@2.4.0...@exodus/tx-signer@2.4.1) (2024-07-31)

### Bug Fixes

- pass actual key identifier ([#8162](https://github.com/ExodusMovement/exodus-hydra/issues/8162)) ([d3fbeab](https://github.com/ExodusMovement/exodus-hydra/commit/d3fbeab8a298188057e6dddfc701c7af988fd81b))

## [2.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/tx-signer@2.3.4...@exodus/tx-signer@2.4.0) (2024-07-31)

### Features

- pass `compatibilityMode` in `txMeta` ([#8136](https://github.com/ExodusMovement/exodus-hydra/issues/8136)) ([ee15867](https://github.com/ExodusMovement/exodus-hydra/commit/ee158672f1b09c94dd8bead6adbd27385c47d62e))

## [2.3.4](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/tx-signer@2.3.3...@exodus/tx-signer@2.3.4) (2024-07-25)

### Bug Fixes

- migrate definitions ([#8030](https://github.com/ExodusMovement/exodus-hydra/issues/8030)) ([d2dfde5](https://github.com/ExodusMovement/exodus-hydra/commit/d2dfde55dfa843eb52842f64b3aac3a6f9a59069))

## [2.3.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/tx-signer@2.3.2...@exodus/tx-signer@2.3.3) (2024-07-16)

### Bug Fixes

- use key identifier with enumerable derivation path ([#7854](https://github.com/ExodusMovement/exodus-hydra/issues/7854)) ([afd9653](https://github.com/ExodusMovement/exodus-hydra/commit/afd96533198a870568a83c4ecf03ead17d7797c1))

## [2.3.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/tx-signer@2.3.1...@exodus/tx-signer@2.3.2) (2024-05-24)

### Bug Fixes

- cant use 'in' operator for undefined txMeta ([#7044](https://github.com/ExodusMovement/exodus-hydra/issues/7044)) ([a2b19f5](https://github.com/ExodusMovement/exodus-hydra/commit/a2b19f55fa6bb1b2448606c022cc2da1321f272e))

## [2.3.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/tx-signer@2.3.0...@exodus/tx-signer@2.3.1) (2024-05-09)

**Note:** Version bump only for package @exodus/tx-signer

## [2.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/tx-signer@2.2.0...@exodus/tx-signer@2.3.0) (2024-05-08)

### Features

- seed signer support for multiple keyids ([#6497](https://github.com/ExodusMovement/exodus-hydra/issues/6497)) ([739dbfd](https://github.com/ExodusMovement/exodus-hydra/commit/739dbfd87d5005b766b292b6fe97505c7c2d0616))

## [2.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/tx-signer@2.1.2...@exodus/tx-signer@2.2.0) (2024-04-26)

### Features

- add type declarations to argo ([#6571](https://github.com/ExodusMovement/exodus-hydra/issues/6571)) ([e6054e3](https://github.com/ExodusMovement/exodus-hydra/commit/e6054e3281c0026d9f777b8756c1013261ea050e))

## [2.1.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/tx-signer@2.1.1...@exodus/tx-signer@2.1.2) (2024-04-02)

- add getPublicKey to signer ([#6274](https://github.com/ExodusMovement/exodus-hydra/pull/6274))

## [2.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/tx-signer@2.1.0...@exodus/tx-signer@2.1.1) (2024-04-02)

### Bug Fixes

- port message signer changes to transaction signer ([#6319](https://github.com/ExodusMovement/exodus-hydra/issues/6319)) ([401f7f2](https://github.com/ExodusMovement/exodus-hydra/commit/401f7f21332426de1fcf74107dcc69752f035541))

## [2.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/tx-signer@2.0.1...@exodus/tx-signer@2.1.0) (2024-03-18)

### Features

- add support for signer ([#5926](https://github.com/ExodusMovement/exodus-hydra/issues/5926)) ([a0331f5](https://github.com/ExodusMovement/exodus-hydra/commit/a0331f59fa5f74a34418dcd018379734c85333cb))

## [2.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/tx-signer@2.0.0...@exodus/tx-signer@2.0.1) (2024-03-08)

### Bug Fixes

- get supported purposes through address provider ([#5992](https://github.com/ExodusMovement/exodus-hydra/issues/5992)) ([0511289](https://github.com/ExodusMovement/exodus-hydra/commit/05112898cc21d735ea504224460a4ca29956e547))

## [2.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/tx-signer@1.3.0...@exodus/tx-signer@2.0.0) (2024-02-19)

### ⚠ BREAKING CHANGES

- support multi-seed in `signTransaction` (#5718)

### Features

- support multi-seed in `signTransaction` ([#5718](https://github.com/ExodusMovement/exodus-hydra/issues/5718)) ([6fd2a1d](https://github.com/ExodusMovement/exodus-hydra/commit/6fd2a1d4536fef2c19df2c9147c6411dd2c57d2a))

## [1.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/tx-signer@1.2.0...@exodus/tx-signer@1.3.0) (2024-02-12)

- refactor: delegate through seedBasedTransactionSigner to `keychain` instead of `wallet` ([#5612](https://github.com/ExodusMovement/exodus-hydra/issues/5612)) ([ef8b274](https://github.com/ExodusMovement/exodus-hydra/commit/ef8b2748069cbee278c7524a22e89d7fbfa67b55))

## [1.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/tx-signer@1.1.0...@exodus/tx-signer@1.2.0) (2024-02-01)

### Features

- add transaction signer api ([#5568](https://github.com/ExodusMovement/exodus-hydra/issues/5568)) ([ffa3a10](https://github.com/ExodusMovement/exodus-hydra/commit/ffa3a1054ff5eaca1497aff66ba0c8c0fc5e5c08))

## [1.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/tx-signer@1.0.0...@exodus/tx-signer@1.1.0) (2023-08-31)

### Features

- **tx-signer:** restructure as feature ([#3750](https://github.com/ExodusMovement/exodus-hydra/issues/3750)) ([7d045a9](https://github.com/ExodusMovement/exodus-hydra/commit/7d045a96d0217a6f011193b8541506a5e3743e1a))

### Bug Fixes

- **tx-signer:** add default main entrypoint ([#3796](https://github.com/ExodusMovement/exodus-hydra/issues/3796)) ([27f50b3](https://github.com/ExodusMovement/exodus-hydra/commit/27f50b3870f606b7bbf34ced761f822b6937c9b4))
