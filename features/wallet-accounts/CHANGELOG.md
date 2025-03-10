# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [17.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@17.3.2...@exodus/wallet-accounts@17.4.0) (2025-03-07)

### Features

- feat: expose `disableMany` (#11687)

### Bug Fixes

- fix: wallet accounts config validation (#11671)

## [17.3.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@17.3.1...@exodus/wallet-accounts@17.3.2) (2025-02-21)

### Bug Fixes

- fix: use toRedactedJSON in wallet-accounts report (#11576)

## [17.3.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@17.3.0...@exodus/wallet-accounts@17.3.1) (2025-02-21)

### Bug Fixes

- fix: prototype pollution vulnerability (#11527)

- fix: skip exporting most reports if wallet doesn't exist (#11553)

## [17.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@17.2.1...@exodus/wallet-accounts@17.3.0) (2025-02-10)

### Features

- feat(wallet-accounts): redact wallet account labels in report (#11395)

## [17.2.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@17.2.0...@exodus/wallet-accounts@17.2.1) (2025-02-07)

### Bug Fixes

- fix(pickBy): pass key to callback (#11376)

## [17.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@17.1.3...@exodus/wallet-accounts@17.2.0) (2025-02-05)

### Features

- feat(headless): type debug apis (#11235)

- feat(wallet-accounts): not throw an error when seedId is not defined on unlocking (#11310)

## [17.1.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@17.1.2...@exodus/wallet-accounts@17.1.3) (2024-12-20)

### License

- license: re-license under MIT license (#10599)

## [17.1.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@17.1.1...@exodus/wallet-accounts@17.1.2) (2024-12-06)

### Bug Fixes

- fix: don't wait fusion when fix mismatch in wallet account (#10624)

## [17.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@17.1.0...@exodus/wallet-accounts@17.1.1) (2024-11-21)

### Bug Fixes

- fix: don't observe walletAccountsAtom until onStart (#10535)

## [17.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@17.0.1...@exodus/wallet-accounts@17.1.0) (2024-11-04)

### Features

- **wallet-account:** add isLedger selectors ([#10282](https://github.com/ExodusMovement/exodus-hydra/issues/10282)) ([2ecb32f](https://github.com/ExodusMovement/exodus-hydra/commit/2ecb32f7b1509f8d654262afdc31436d9af71f9e))

## [17.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@17.0.0...@exodus/wallet-accounts@17.0.1) (2024-10-21)

### Bug Fixes

- update seedId for walletAccount inside load ([#9327](https://github.com/ExodusMovement/exodus-hydra/issues/9327)) ([f82905c](https://github.com/ExodusMovement/exodus-hydra/commit/f82905c5d1c23a7f46019d201079530140a27f8a))

## [17.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@16.12.0...@exodus/wallet-accounts@17.0.0) (2024-10-03)

### ⚠ BREAKING CHANGES

- don't provide a default wallet account in redux to avoid double computation (#9575)

### Features

- don't provide a default wallet account in redux to avoid double computation ([#9575](https://github.com/ExodusMovement/exodus-hydra/issues/9575)) ([f3bc065](https://github.com/ExodusMovement/exodus-hydra/commit/f3bc065f1a6f5112beb1e93a14cb035dfec33afc))

## [16.12.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@16.11.0...@exodus/wallet-accounts@16.12.0) (2024-09-23)

### Features

- make wallet accounts loaded only after `multipleWalletAccountsEnabled` emitted ([#9364](https://github.com/ExodusMovement/exodus-hydra/issues/9364)) ([55c7e51](https://github.com/ExodusMovement/exodus-hydra/commit/55c7e5114b15452ba25b57ce3ef8ab4aa61674bc))

## [16.11.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@16.10.2...@exodus/wallet-accounts@16.11.0) (2024-09-16)

### Features

- return created wallets in wallet-accounts ([#9219](https://github.com/ExodusMovement/exodus-hydra/issues/9219)) ([1892144](https://github.com/ExodusMovement/exodus-hydra/commit/1892144cd0c1862b4bcf48eba8376f90af8bf368))

## [16.10.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@16.10.1...@exodus/wallet-accounts@16.10.2) (2024-09-09)

**Note:** Version bump only for package @exodus/wallet-accounts

## [16.10.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@16.10.0...@exodus/wallet-accounts@16.10.1) (2024-09-02)

**Note:** Version bump only for package @exodus/wallet-accounts

## [16.10.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@16.9.0...@exodus/wallet-accounts@16.10.0) (2024-08-20)

### Features

- make wallet-accounts valid ESM ([#8563](https://github.com/ExodusMovement/exodus-hydra/issues/8563)) ([6c03327](https://github.com/ExodusMovement/exodus-hydra/commit/6c03327b97ddbc01401705a900fb0f4aec521249))

## [16.9.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@16.8.3...@exodus/wallet-accounts@16.9.0) (2024-08-16)

### Features

- create wallet accounts for seedIds without them ([#8476](https://github.com/ExodusMovement/exodus-hydra/issues/8476)) ([a0c4434](https://github.com/ExodusMovement/exodus-hydra/commit/a0c443476e23bcdf945ae8e538eb84572ddf758d))

## [16.8.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@16.8.2...@exodus/wallet-accounts@16.8.3) (2024-07-26)

### Bug Fixes

- move wallet-accounts config up to feature ([#8074](https://github.com/ExodusMovement/exodus-hydra/issues/8074)) ([ab9059c](https://github.com/ExodusMovement/exodus-hydra/commit/ab9059c5d70927e18f9a9f8062d5d914e9208c84))

## [16.8.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@16.8.1...@exodus/wallet-accounts@16.8.2) (2024-07-25)

### Bug Fixes

- migrate definitions ([#8030](https://github.com/ExodusMovement/exodus-hydra/issues/8030)) ([d2dfde5](https://github.com/ExodusMovement/exodus-hydra/commit/d2dfde55dfa843eb52842f64b3aac3a6f9a59069))
- walletAccountsAtom config is optional ([#7988](https://github.com/ExodusMovement/exodus-hydra/issues/7988)) ([40a040b](https://github.com/ExodusMovement/exodus-hydra/commit/40a040be5c3ff7a85b281161d2fb351927df8af3))

## [16.8.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@16.8.0...@exodus/wallet-accounts@16.8.1) (2024-07-18)

**Note:** Version bump only for package @exodus/wallet-accounts

## [16.8.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@16.7.2...@exodus/wallet-accounts@16.8.0) (2024-07-11)

### Features

- **wallet-accounts:** generate the node's safe report in the report node ([#7784](https://github.com/ExodusMovement/exodus-hydra/issues/7784)) ([1c0b966](https://github.com/ExodusMovement/exodus-hydra/commit/1c0b966552cec890c025c5a885cc95d0935606a2))

## [16.7.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@16.7.1...@exodus/wallet-accounts@16.7.2) (2024-07-03)

### Bug Fixes

- removeMany for hardware accounts ([#7620](https://github.com/ExodusMovement/exodus-hydra/issues/7620)) ([2434922](https://github.com/ExodusMovement/exodus-hydra/commit/2434922582b17c44bbc5d4f05cd360afa40fba55))

## [16.7.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@16.7.0...@exodus/wallet-accounts@16.7.1) (2024-06-26)

### Bug Fixes

- **wallet-accounts:** prefer config defined label for new seeds default account ([#7512](https://github.com/ExodusMovement/exodus-hydra/issues/7512)) ([fbe3e31](https://github.com/ExodusMovement/exodus-hydra/commit/fbe3e31e152f08363de35b12cb1dfdc6596a5d20))

## [16.7.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@16.6.0...@exodus/wallet-accounts@16.7.0) (2024-06-25)

### Features

- **wallet-accounts:** expose removeMany in API slice ([#7491](https://github.com/ExodusMovement/exodus-hydra/issues/7491)) ([8b1df66](https://github.com/ExodusMovement/exodus-hydra/commit/8b1df66f8feaed0fa7b7e0330b91f0253d8936c3))

## [16.6.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@16.5.2...@exodus/wallet-accounts@16.6.0) (2024-06-18)

### Features

- support defaultColor in walletAccountsAtom ([#7418](https://github.com/ExodusMovement/exodus-hydra/issues/7418)) ([977e0d8](https://github.com/ExodusMovement/exodus-hydra/commit/977e0d889946c9bca524455ed6f6e7ffd01e1df1))

## [16.5.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@16.5.1...@exodus/wallet-accounts@16.5.2) (2024-05-28)

### Bug Fixes

- set walletAccount defaultLabel in migration ([#7134](https://github.com/ExodusMovement/exodus-hydra/issues/7134)) ([3a24900](https://github.com/ExodusMovement/exodus-hydra/commit/3a24900e000af929e34f094fd4406e39b48c58dc))

## [16.5.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@16.5.0...@exodus/wallet-accounts@16.5.1) (2024-05-21)

### Bug Fixes

- remove `compatibilityMode` from flagsStorage ([#7039](https://github.com/ExodusMovement/exodus-hydra/issues/7039)) ([50f5a7d](https://github.com/ExodusMovement/exodus-hydra/commit/50f5a7d48e039c1629cba6b64d0c952b86cdda3c))

## [16.5.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@16.4.0...@exodus/wallet-accounts@16.5.0) (2024-05-13)

### Features

- remove obsolete migration ([#6914](https://github.com/ExodusMovement/exodus-hydra/issues/6914)) ([217b9be](https://github.com/ExodusMovement/exodus-hydra/commit/217b9be1ad9ffdcbb4eb5a098b408287145614f9))

## [16.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@16.3.1...@exodus/wallet-accounts@16.4.0) (2024-04-26)

### Features

- add wallet accounts & address provider api types ([#6593](https://github.com/ExodusMovement/exodus-hydra/issues/6593)) ([16c2c95](https://github.com/ExodusMovement/exodus-hydra/commit/16c2c9513b8c5caa46570102d313df168b56586f))

## [16.3.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@16.3.0...@exodus/wallet-accounts@16.3.1) (2024-04-08)

### Bug Fixes

- dedupe walletAccountsAtom ([#6407](https://github.com/ExodusMovement/exodus-hydra/issues/6407)) ([ab18b4d](https://github.com/ExodusMovement/exodus-hydra/commit/ab18b4d6adc0055ac5b3d063ed9b507ce6440e32))

## [16.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@16.2.0...@exodus/wallet-accounts@16.3.0) (2024-03-18)

### Features

- exodus.debug.walletAccounts.getAllWalletAccountsEver ([#6015](https://github.com/ExodusMovement/exodus-hydra/issues/6015)) ([c3ae060](https://github.com/ExodusMovement/exodus-hydra/commit/c3ae06066a4b190abca775c61a71ff8082401a46))
- update `compatibilityMode` if not set ([#6123](https://github.com/ExodusMovement/exodus-hydra/issues/6123)) ([732582c](https://github.com/ExodusMovement/exodus-hydra/commit/732582c9b631c4b3a5d60e27d4cb110628e2543f))
- update default wallet account with mode and seed id ([#6091](https://github.com/ExodusMovement/exodus-hydra/issues/6091)) ([311061f](https://github.com/ExodusMovement/exodus-hydra/commit/311061fea6b6fb5bfea6bb8992ae01fa475f50d1))

## [16.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@16.1.2...@exodus/wallet-accounts@16.2.0) (2024-03-08)

### Features

- application lifecycle hook addSeed ([#5838](https://github.com/ExodusMovement/exodus-hydra/issues/5838)) ([3c58290](https://github.com/ExodusMovement/exodus-hydra/commit/3c58290ec54ef3943bb502048c9719576ac9bbcf))
- compatiblity mode migration ([#5809](https://github.com/ExodusMovement/exodus-hydra/issues/5809)) ([a627c5f](https://github.com/ExodusMovement/exodus-hydra/commit/a627c5fdef6d8dce29db2f3ca9f8a5dcb91a3246))
- migration to add `seedId` to exodus wallet accounts ([#5782](https://github.com/ExodusMovement/exodus-hydra/issues/5782)) ([7670a39](https://github.com/ExodusMovement/exodus-hydra/commit/7670a392a80420d354979548db521e9c3d29c8dc))
- multi-seed migration on an unencrypted storage ([#6031](https://github.com/ExodusMovement/exodus-hydra/issues/6031)) ([91bfb8b](https://github.com/ExodusMovement/exodus-hydra/commit/91bfb8b562895d0a4d6a920482be38ac2dfb8e2c))
- **wallet-accounts:** debug api ([#5465](https://github.com/ExodusMovement/exodus-hydra/issues/5465)) ([7283f0d](https://github.com/ExodusMovement/exodus-hydra/commit/7283f0d29e8e7a34fd860cc10ba1d98cb0cccc15))

### Bug Fixes

- don't allow account index reuse for same seed ([#5800](https://github.com/ExodusMovement/exodus-hydra/issues/5800)) ([58cfbab](https://github.com/ExodusMovement/exodus-hydra/commit/58cfbabd4ae63a92b5a4311b61494ef519a9a250))
- wipe the public keys of deleted HW portfolios ([#5817](https://github.com/ExodusMovement/exodus-hydra/issues/5817)) ([8ba2fcc](https://github.com/ExodusMovement/exodus-hydra/commit/8ba2fcccc46384f0ac0a96d3c6e3d317c3686da9))

## [16.1.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@16.1.1...@exodus/wallet-accounts@16.1.2) (2024-02-26)

### Bug Fixes

- clear internal state ([#5848](https://github.com/ExodusMovement/exodus-hydra/issues/5848)) ([0a17763](https://github.com/ExodusMovement/exodus-hydra/commit/0a17763c8565d90dd39a54d301c58c0ddf8ad97d))

## [16.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@16.1.0...@exodus/wallet-accounts@16.1.1) (2024-02-22)

### Bug Fixes

- don't throw when syncing down and wallet accounts not loaded yet ([#5816](https://github.com/ExodusMovement/exodus-hydra/issues/5816)) ([7aed8cb](https://github.com/ExodusMovement/exodus-hydra/commit/7aed8cb73b5c1ae4d546108674dbb05c70a0be44))

## [16.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@16.0.0...@exodus/wallet-accounts@16.1.0) (2024-02-22)

### Features

- inherit compatibility mode from default wallet account ([#5811](https://github.com/ExodusMovement/exodus-hydra/issues/5811)) ([6d83ac1](https://github.com/ExodusMovement/exodus-hydra/commit/6d83ac10aa056f23aef3e457d440e53938311edf))
- set compatibility mode to default account's mode ([#5810](https://github.com/ExodusMovement/exodus-hydra/issues/5810)) ([e573c88](https://github.com/ExodusMovement/exodus-hydra/commit/e573c88117f9af7aeff0881a5ef93b153df0be4c))

## [16.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@15.2.0...@exodus/wallet-accounts@16.0.0) (2024-02-19)

### Features

- populate `seedId` on fusion sync ([#5730](https://github.com/ExodusMovement/exodus-hydra/issues/5730)) ([20440e9](https://github.com/ExodusMovement/exodus-hydra/commit/20440e9321a5b14813a091704c3329201c824284))
- prevent updating `seedId` ([#5745](https://github.com/ExodusMovement/exodus-hydra/issues/5745)) ([7f022d7](https://github.com/ExodusMovement/exodus-hydra/commit/7f022d759aba2cd3dd9f046c04b62c922abbb0cf))
- set `seedId` when creating exodus wallet accounts ([#5744](https://github.com/ExodusMovement/exodus-hydra/issues/5744)) ([ded3859](https://github.com/ExodusMovement/exodus-hydra/commit/ded3859945756625b664ff7376ef7486349840b4))

### Bug Fixes

- derive indices separetely for `seedId` ([#5732](https://github.com/ExodusMovement/exodus-hydra/issues/5732)) ([2669d19](https://github.com/ExodusMovement/exodus-hydra/commit/2669d1963b47342c085c505343e533ac5272ea91))

## [15.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@15.1.0...@exodus/wallet-accounts@15.2.0) (2024-02-15)

### Features

- derive separate indices per compatiblity mode and id ([#5714](https://github.com/ExodusMovement/exodus-hydra/issues/5714)) ([70ef352](https://github.com/ExodusMovement/exodus-hydra/commit/70ef352331da5a3eab862869efadadba83176045))

### Bug Fixes

- missing dependencies ([#5322](https://github.com/ExodusMovement/exodus-hydra/issues/5322)) ([01efedc](https://github.com/ExodusMovement/exodus-hydra/commit/01efedc7508fb14925277fdcd388afb721ac3dd1))

## [15.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@15.0.0...@exodus/wallet-accounts@15.1.0) (2023-12-28)

### Features

- add `createMany` ([#5111](https://github.com/ExodusMovement/exodus-hydra/issues/5111)) ([a7cb9bf](https://github.com/ExodusMovement/exodus-hydra/commit/a7cb9bf4af027ff87904b50ca7d641a901fc6832))
- add `removeMany` ([#5113](https://github.com/ExodusMovement/exodus-hydra/issues/5113)) ([d77ab45](https://github.com/ExodusMovement/exodus-hydra/commit/d77ab45270c8605a37ba9db773431a3157b2a9ae))
- add `updateMany` ([#5112](https://github.com/ExodusMovement/exodus-hydra/issues/5112)) ([5ab4da4](https://github.com/ExodusMovement/exodus-hydra/commit/5ab4da48613575a660b5f12699df422ef9cb9270))
- fill gap indexes on walletAccount creation ([#5084](https://github.com/ExodusMovement/exodus-hydra/issues/5084)) ([582344f](https://github.com/ExodusMovement/exodus-hydra/commit/582344ff450b8541cd72ac78c51324d3e320f3b0))

## [15.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@14.4.0...@exodus/wallet-accounts@15.0.0) (2023-12-07)

### ⚠ BREAKING CHANGES

- pass max wallet account amount to redux module (#4968)

### Features

- pass max wallet account amount to redux module ([#4968](https://github.com/ExodusMovement/exodus-hydra/issues/4968)) ([e6ab869](https://github.com/ExodusMovement/exodus-hydra/commit/e6ab8696da1ae56921ca4faef2b964096c005280))

## [14.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@14.3.0...@exodus/wallet-accounts@14.4.0) (2023-11-27)

### Features

- **wallet-accounts:** support default custom labels ([#4885](https://github.com/ExodusMovement/exodus-hydra/issues/4885)) ([d902da9](https://github.com/ExodusMovement/exodus-hydra/commit/d902da92402f6b8e71221cb11e3e9d0984e8ddd6))

## [14.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@14.2.0...@exodus/wallet-accounts@14.3.0) (2023-11-23)

### Features

- expand hardware public keys api in `walletAccounts` ([#4723](https://github.com/ExodusMovement/exodus-hydra/issues/4723)) ([fd40db8](https://github.com/ExodusMovement/exodus-hydra/commit/fd40db84fb5b92505037823e170b53563502de01))

### Bug Fixes

- add atom observers to hardwareWalletPublicKeysAtom ([#4867](https://github.com/ExodusMovement/exodus-hydra/issues/4867)) ([f782d4a](https://github.com/ExodusMovement/exodus-hydra/commit/f782d4a8d96010d3f70f34930d462b0a487b6d73))

## [14.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@14.1.0...@exodus/wallet-accounts@14.2.0) (2023-10-20)

### Features

- hasMultipleWalletAccountsEnabledSelector ([#4521](https://github.com/ExodusMovement/exodus-hydra/issues/4521)) ([15eff0a](https://github.com/ExodusMovement/exodus-hydra/commit/15eff0a8783c4974e09dd344122ff68fc8f6ec94))

## [14.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@14.0.0...@exodus/wallet-accounts@14.1.0) (2023-09-21)

### Features

- **wallet-accounts:** add atom observers for reducers ([#3863](https://github.com/ExodusMovement/exodus-hydra/issues/3863)) ([a346c50](https://github.com/ExodusMovement/exodus-hydra/commit/a346c50447433ee9e8b6950b9b4fffb0b464aaa3))

## [14.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@13.0.0...@exodus/wallet-accounts@14.0.0) (2023-08-29)

### ⚠ BREAKING CHANGES

- dont attach `enabledWalletAccounts` to port (#3715)

### Features

- dont attach `enabledWalletAccounts` to port ([#3715](https://github.com/ExodusMovement/exodus-hydra/issues/3715)) ([2e57f30](https://github.com/ExodusMovement/exodus-hydra/commit/2e57f3018e9142e115645e092eb5039e65f22c1e))

### Bug Fixes

- add observing atoms to unlock if conditional ([#3726](https://github.com/ExodusMovement/exodus-hydra/issues/3726)) ([1112fc5](https://github.com/ExodusMovement/exodus-hydra/commit/1112fc5e1a6731d3d97b4e20541a96d4ba06a228))

## [13.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@12.0.2...@exodus/wallet-accounts@13.0.0) (2023-08-29)

### ⚠ BREAKING CHANGES

- remove store and actions from setup redux (#3575)

### Features

- add all non custodial selector to wallet-accounts ([#3457](https://github.com/ExodusMovement/exodus-hydra/issues/3457)) ([a8c1d12](https://github.com/ExodusMovement/exodus-hydra/commit/a8c1d124d96dad0de5dbded74c9b0d7677b6f954))
- add export path name selector to wallet-accounts ([#3456](https://github.com/ExodusMovement/exodus-hydra/issues/3456)) ([25242de](https://github.com/ExodusMovement/exodus-hydra/commit/25242de8f8bd67db4ae747598f2cdb454b0c0379))
- add find selector to wallet-accounts ([#3447](https://github.com/ExodusMovement/exodus-hydra/issues/3447)) ([245cc32](https://github.com/ExodusMovement/exodus-hydra/commit/245cc32f46685809e5934d44395a59a431ef54f3))
- add path friendly name selector to wallet-accounts ([#3455](https://github.com/ExodusMovement/exodus-hydra/issues/3455)) ([f661058](https://github.com/ExodusMovement/exodus-hydra/commit/f6610588c775e24dbcc2fd6b132577b43f5d6307))
- add proper name selectors to wallet-accounts ([#3449](https://github.com/ExodusMovement/exodus-hydra/issues/3449)) ([482b0ca](https://github.com/ExodusMovement/exodus-hydra/commit/482b0cad6c3781fb98537853bd7467718b4a2356))
- **wallet-accounts:** add atom observers ([#3634](https://github.com/ExodusMovement/exodus-hydra/issues/3634)) ([f8a84f9](https://github.com/ExodusMovement/exodus-hydra/commit/f8a84f9bcdd3573728af657bc5f91479968b2686))
- **wallet-accounts:** add more check selectors ([#3652](https://github.com/ExodusMovement/exodus-hydra/issues/3652)) ([5966f45](https://github.com/ExodusMovement/exodus-hydra/commit/5966f45be7defcd55b07eaa43f77234440ade1c4))
- **wallet-accounts:** add more filtering selectors ([#3653](https://github.com/ExodusMovement/exodus-hydra/issues/3653)) ([efbafeb](https://github.com/ExodusMovement/exodus-hydra/commit/efbafebbc36fc550732b2dc0459cd347ac00af8f))
- **wallet-accounts:** add next index selector ([#3650](https://github.com/ExodusMovement/exodus-hydra/issues/3650)) ([07bf6bc](https://github.com/ExodusMovement/exodus-hydra/commit/07bf6bc72301f0b1d82e083c22e3e5f26a7227fc))

### Code Refactoring

- remove store and actions from setup redux ([#3575](https://github.com/ExodusMovement/exodus-hydra/issues/3575)) ([64fa4a6](https://github.com/ExodusMovement/exodus-hydra/commit/64fa4a6c2b69409a81ab140adbdf84646f1be73a))

## [12.0.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@12.0.1...@exodus/wallet-accounts@12.0.2) (2023-08-13)

### Bug Fixes

- wallet-accounts redux module ([#3327](https://github.com/ExodusMovement/exodus-hydra/issues/3327)) ([bcc9472](https://github.com/ExodusMovement/exodus-hydra/commit/bcc947259fe0edc660b87ccde2eb3302fd5faf0b))

## [12.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@12.0.0...@exodus/wallet-accounts@12.0.1) (2023-08-08)

### Bug Fixes

- use @exodus/fusion-atoms instead of @exodus/fusion/atoms ([#3228](https://github.com/ExodusMovement/exodus-hydra/issues/3228)) ([e700ab0](https://github.com/ExodusMovement/exodus-hydra/commit/e700ab0b886408e27ac2f30f75b570e6dcaf191d))

## [12.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@11.0.0...@exodus/wallet-accounts@12.0.0) (2023-08-04)

### ⚠ BREAKING CHANGES

- **wallet-accounts:** remove bulkUpsert (#3170)

### Features

- assert wallet account presence before update ([#3169](https://github.com/ExodusMovement/exodus-hydra/issues/3169)) ([275e0ce](https://github.com/ExodusMovement/exodus-hydra/commit/275e0ce21e6be1c5822ab29b15788eb817baac05))
- **wallet-accounts:** remove bulkUpsert ([#3170](https://github.com/ExodusMovement/exodus-hydra/issues/3170)) ([cb5c8fc](https://github.com/ExodusMovement/exodus-hydra/commit/cb5c8fc65f74be0306237c5b1377d5480221f285))

## [11.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@10.2.0...@exodus/wallet-accounts@11.0.0) (2023-08-02)

### ⚠ BREAKING CHANGES

- **wallet-accounts:** disable api (#3105)

### Features

- **wallet-accounts:** ensure active wallet account enabled ([#3100](https://github.com/ExodusMovement/exodus-hydra/issues/3100)) ([f304c48](https://github.com/ExodusMovement/exodus-hydra/commit/f304c484ddfe837da01b5e2a225d72cc9834a969))

### Bug Fixes

- **wallet-accounts:** publish report node ([#3118](https://github.com/ExodusMovement/exodus-hydra/issues/3118)) ([519e56b](https://github.com/ExodusMovement/exodus-hydra/commit/519e56b3e6dbbceb4d0926488894efb134e917fc))

### Code Refactoring

- **wallet-accounts:** disable api ([#3105](https://github.com/ExodusMovement/exodus-hydra/issues/3105)) ([9337479](https://github.com/ExodusMovement/exodus-hydra/commit/9337479d28b968a880a0177427be083007b86eb9))

## [10.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@10.1.1...@exodus/wallet-accounts@10.2.0) (2023-07-31)

### Features

- add wallet accounts report ([#2953](https://github.com/ExodusMovement/exodus-hydra/issues/2953)) ([85953f2](https://github.com/ExodusMovement/exodus-hydra/commit/85953f2306129d59c7b51cf8159adad407a7cd19))

## [10.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@10.1.0...@exodus/wallet-accounts@10.1.1) (2023-07-11)

### Bug Fixes

- wallet accounts plugin load call ([#2525](https://github.com/ExodusMovement/exodus-hydra/issues/2525)) ([e2675b7](https://github.com/ExodusMovement/exodus-hydra/commit/e2675b73e10011cb622dae89255973448fb6ab2d))

## [10.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@9.2.0...@exodus/wallet-accounts@10.1.0) (2023-07-07)

### Features

- wallet-accounts feature ([#2364](https://github.com/ExodusMovement/exodus-hydra/issues/2364)) ([bec9d98](https://github.com/ExodusMovement/exodus-hydra/commit/bec9d9803973c8b639ea76484296d2f2514b57c3))

## [10.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@9.2.0...@exodus/wallet-accounts@10.0.0) (2023-07-06)

### ⚠ BREAKING CHANGES

- wallet-accounts feature (#2364)

### Features

- wallet-accounts feature ([#2364](https://github.com/ExodusMovement/exodus-hydra/issues/2364)) ([bec9d98](https://github.com/ExodusMovement/exodus-hydra/commit/bec9d9803973c8b639ea76484296d2f2514b57c3))

## [9.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@9.1.0...@exodus/wallet-accounts@9.2.0) (2023-06-23)

### Features

- **compute:** remove second argument of callback ([#2080](https://github.com/ExodusMovement/exodus-hydra/issues/2080)) ([4a42ab6](https://github.com/ExodusMovement/exodus-hydra/commit/4a42ab687f74496719d166f13bd2eaa3730fb9b6))

## [9.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@9.0.1...@exodus/wallet-accounts@9.1.0) (2023-06-21)

### Features

- add active wallet account selectors ([#1598](https://github.com/ExodusMovement/exodus-hydra/issues/1598)) ([b2d4ac2](https://github.com/ExodusMovement/exodus-hydra/commit/b2d4ac22c9e129869a3619d46fda22ad4a98cd6b))

### Bug Fixes

- master ci ([#1613](https://github.com/ExodusMovement/exodus-hydra/issues/1613)) ([44e3063](https://github.com/ExodusMovement/exodus-hydra/commit/44e306304338d5ce3cbc21757b6b3e91f5d95210))

## [9.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@9.0.0...@exodus/wallet-accounts@9.0.1) (2023-05-09)

**Note:** Version bump only for package @exodus/wallet-accounts

## [9.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@8.0.1...@exodus/wallet-accounts@9.0.0) (2023-05-08)

### ⚠ BREAKING CHANGES

- do not emit on wallet-accounts-module (#1436)

### Features

- do not emit on wallet-accounts-module ([#1436](https://github.com/ExodusMovement/exodus-hydra/issues/1436)) ([e67d309](https://github.com/ExodusMovement/exodus-hydra/commit/e67d3098cb78df000e5046e8a9abc09390a79ec8))

## [8.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@7.0.1...@exodus/wallet-accounts@8.0.0) (2023-01-23)

### ⚠ BREAKING CHANGES

- replace 'allowedSources' with 'config' option in wallet-accounts module (#765)

### Code Refactoring

- replace 'allowedSources' with 'config' option in wallet-accounts module ([#765](https://github.com/ExodusMovement/exodus-hydra/issues/765)) ([88a1d33](https://github.com/ExodusMovement/exodus-hydra/commit/88a1d3308f85529130860a546e709f66bde347be))

## [7.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@7.0.0...@exodus/wallet-accounts@7.0.1) (2023-01-20)

### Bug Fixes

- wallet-accounts atoms deps ([#751](https://github.com/ExodusMovement/exodus-hydra/issues/751)) ([0df601c](https://github.com/ExodusMovement/exodus-hydra/commit/0df601c81d859457e030fe757848896e9390f483))

## [7.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@6.0.0...@exodus/wallet-accounts@7.0.0) (2023-01-20)

### ⚠ BREAKING CHANGES

- wallet-accounts module to export module/ atoms/ folders (#682)
- export walletAccounts dependency injection metadata (#647)

### Features

- export walletAccounts dependency injection metadata ([#647](https://github.com/ExodusMovement/exodus-hydra/issues/647)) ([b519089](https://github.com/ExodusMovement/exodus-hydra/commit/b51908920012e1893b23e52a1582c12ca9b33a7a))

### Code Refactoring

- wallet-accounts module to export module/ atoms/ folders ([#682](https://github.com/ExodusMovement/exodus-hydra/issues/682)) ([096a419](https://github.com/ExodusMovement/exodus-hydra/commit/096a4197db03d7625c8fb105f154a13e45b814a3))

## [6.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@5.1.0...@exodus/wallet-accounts@6.0.0) (2022-12-07)

### ⚠ BREAKING CHANGES

- make fusion.channel() sync for easier consumption (#568)

### Features

- make fusion.channel() sync for easier consumption ([#568](https://github.com/ExodusMovement/exodus-hydra/issues/568)) ([d180529](https://github.com/ExodusMovement/exodus-hydra/commit/d180529e1d764bd5c89fd5196dd283f190473548))

## [5.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@5.0.2...@exodus/wallet-accounts@5.1.0) (2022-12-02)

### Features

- add walletAccountsAtom ([#558](https://github.com/ExodusMovement/exodus-hydra/issues/558)) ([c0c2330](https://github.com/ExodusMovement/exodus-hydra/commit/c0c2330e0f5bd12c1e5a36b4fd39b10be2824a25))

## [5.0.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@5.0.1...@exodus/wallet-accounts@5.0.2) (2022-11-29)

### Bug Fixes

- export default from index ([e30511d](https://github.com/ExodusMovement/exodus-hydra/commit/e30511dd6406fd10ebab420565f1282f0949a372))

## [5.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@5.0.0...@exodus/wallet-accounts@5.0.1) (2022-11-29)

**Note:** Version bump only for package @exodus/wallet-accounts

## [5.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@4.1.0...@exodus/wallet-accounts@5.0.0) (2022-11-29)

### ⚠ BREAKING CHANGES

- accept enabled wallet accounts atom (#544)

### Features

- allow in-memory atom without default ([#526](https://github.com/ExodusMovement/exodus-hydra/issues/526)) ([dfbb1a7](https://github.com/ExodusMovement/exodus-hydra/commit/dfbb1a703ed1be380c7cd881057e5dff4f55d3ba))

### Code Refactoring

- accept enabled wallet accounts atom ([#544](https://github.com/ExodusMovement/exodus-hydra/issues/544)) ([bdeaf02](https://github.com/ExodusMovement/exodus-hydra/commit/bdeaf029b6080bbb42d575545e9b711faa21b6c8))

## [4.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@4.0.0...@exodus/wallet-accounts@4.1.0) (2022-11-14)

### Features

- add method to await wallet accounts synced ([#463](https://github.com/ExodusMovement/exodus-hydra/issues/463)) ([d980a59](https://github.com/ExodusMovement/exodus-hydra/commit/d980a5914b038dd73693487801d8325127203492))

## [4.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@3.2.0...@exodus/wallet-accounts@4.0.0) (2022-10-20)

### ⚠ BREAKING CHANGES

- disable software and remove hardware accounts on bulkDisable (#352)
- add bulkUpsert method (#350)

### Features

- add bulkUpsert method ([#350](https://github.com/ExodusMovement/exodus-hydra/issues/350)) ([23a3cfb](https://github.com/ExodusMovement/exodus-hydra/commit/23a3cfb769ad27befd1cb8c5e531e4b5d37551c1))

### Bug Fixes

- prevent backdoor-disabling of default account through update ([#351](https://github.com/ExodusMovement/exodus-hydra/issues/351)) ([00ad104](https://github.com/ExodusMovement/exodus-hydra/commit/00ad10448d0ce66f649845bb12fb4cbe439cdf5e))
- prevent override of changes through down-sync ([#353](https://github.com/ExodusMovement/exodus-hydra/issues/353)) ([a4a25e2](https://github.com/ExodusMovement/exodus-hydra/commit/a4a25e2443ed5089c8fe980e0e2576880a238799))

### Performance Improvements

- skip writes and emissions if update is a no-op ([#313](https://github.com/ExodusMovement/exodus-hydra/issues/313)) ([15d1663](https://github.com/ExodusMovement/exodus-hydra/commit/15d1663f65c6b002affa13243e22efccf8fb04ed))

### Code Refactoring

- disable software and remove hardware accounts on bulkDisable ([#352](https://github.com/ExodusMovement/exodus-hydra/issues/352)) ([b9746b1](https://github.com/ExodusMovement/exodus-hydra/commit/b9746b19f8554227adadb436ea9e1f7ed0de28ef))

## [3.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@3.1.1...@exodus/wallet-accounts@3.2.0) (2022-10-07)

### Features

- add getAccounts method ([#294](https://github.com/ExodusMovement/exodus-hydra/issues/294)) ([b686da3](https://github.com/ExodusMovement/exodus-hydra/commit/b686da358ea028c30aaaa4f6b344dc32017d4b4d))

## [3.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@3.1.0...@exodus/wallet-accounts@3.1.1) (2022-10-03)

### Bug Fixes

- support custodial account creation without index ([#269](https://github.com/ExodusMovement/exodus-hydra/issues/269)) ([0710ad6](https://github.com/ExodusMovement/exodus-hydra/commit/0710ad66c12c630286b8a0633592b1b80902378e))

## [3.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@3.0.1...@exodus/wallet-accounts@3.1.0) (2022-09-27)

### Features

- remove deleted hardware wallet data from fusion ([#243](https://github.com/ExodusMovement/exodus-hydra/issues/243)) ([b9d6fc3](https://github.com/ExodusMovement/exodus-hydra/commit/b9d6fc3cce6d4a0418d6d5336fb23fb2aaa7bc5c))
- **wallet-accounts:** add bulk methods and debounce write operations ([#241](https://github.com/ExodusMovement/exodus-hydra/issues/241)) ([dc98585](https://github.com/ExodusMovement/exodus-hydra/commit/dc98585ae9c9bafc825792dc0ea3ae3c9d2f26c9))

## [3.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@3.0.0...@exodus/wallet-accounts@3.0.1) (2022-08-31)

### Bug Fixes

- wallet accounts clear ([#212](https://github.com/ExodusMovement/exodus-hydra/issues/212)) ([c20aa3c](https://github.com/ExodusMovement/exodus-hydra/commit/c20aa3c5398b9f10d1bf688c185b9c81f7473bc5))

# [3.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@1.0.0...@exodus/wallet-accounts@3.0.0) (2022-08-18)

### Features

- make wallet account module keep track of active portfolio ([#145](https://github.com/ExodusMovement/exodus-hydra/issues/145)) ([b5577da](https://github.com/ExodusMovement/exodus-hydra/commit/b5577da4b976c536aa54791baad1b5f9321dae7a))
- **wallet-accounts:** add getAtom() ([#74](https://github.com/ExodusMovement/exodus-hydra/issues/74)) ([f28c55e](https://github.com/ExodusMovement/exodus-hydra/commit/f28c55ea462996ae751f4327550d87aa535536fd))

# [1.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet-accounts@1.0.0...@exodus/wallet-accounts@1.1.0) (2022-07-26)

### Features

- **wallet-accounts:** add getAtom() ([#74](https://github.com/ExodusMovement/exodus-hydra/issues/74)) ([f28c55e](https://github.com/ExodusMovement/exodus-hydra/commit/f28c55ea462996ae751f4327550d87aa535536fd))
