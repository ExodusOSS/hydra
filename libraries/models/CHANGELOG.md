# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [12.5.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/models@12.4.0...@exodus/models@12.5.0) (2025-02-04)

### Features

- feat(xopay): provider in fiat order model (#11295)

## [12.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/models@12.3.1...@exodus/models@12.4.0) (2025-01-13)

### Features

- feat(orders): add delayed status to orders (#11067)

## [12.3.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/models@12.3.0...@exodus/models@12.3.1) (2025-01-09)

### Bug Fixes

- fix: move EMPTY below isInstance in model sets (#11020)

## [12.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/models@12.2.2...@exodus/models@12.3.0) (2024-12-06)

### Features

- feat: harden `instanceof` and `isInstance` (#10738)

### License

- license: re-license under MIT license (#10355)

## [12.2.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/models@12.2.1...@exodus/models@12.2.2) (2024-12-06)

**Note:** Version bump only for package @exodus/models

## [12.2.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/models@12.2.0...@exodus/models@12.2.1) (2024-12-05)

### Bug Fixes

- fix: optional props in `FiatOrder` and non-generic `FiatOrderSet` (#10712)

## [12.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/models@12.1.1...@exodus/models@12.2.0) (2024-12-02)

### Features

- feat: type `@exodus/models` (#10558)

## [12.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/models@12.1.0...@exodus/models@12.1.1) (2024-10-10)

### Bug Fixes

- TxSet check equal when overwriting transactions ([#9879](https://github.com/ExodusMovement/exodus-hydra/issues/9879)) ([9f7f92c](https://github.com/ExodusMovement/exodus-hydra/commit/9f7f92c1f28570f3d9f9cbcd005de1056ef26fc9))

## [12.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/models@12.0.1...@exodus/models@12.1.0) (2024-10-02)

### Features

- **models:** add isInstance static method to models ([#8938](https://github.com/ExodusMovement/exodus-hydra/issues/8938)) ([b2d4e04](https://github.com/ExodusMovement/exodus-hydra/commit/b2d4e04ab44a433d707869050a51c3fed7a1af54))

### Bug Fixes

- **models:** ReDoS ([#8721](https://github.com/ExodusMovement/exodus-hydra/issues/8721)) ([1aa774d](https://github.com/ExodusMovement/exodus-hydra/commit/1aa774db7e87c0ac77fad4b401869e8b80a2b0a8))

## [12.0.1](https://github.com/ExodusMovement/exodus-core/compare/@exodus/models@12.0.0...@exodus/models@12.0.1) (2024-08-13)

### Bug Fixes

- export ./lib as a (temporary) alias to ./src from models ([#1304](https://github.com/ExodusMovement/exodus-core/issues/1304)) ([207fcca](https://github.com/ExodusMovement/exodus-core/commit/207fcca83bdd40550a38017fc04dee941f86222d))

## [12.0.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/models@11.19.0...@exodus/models@12.0.0) (2024-08-08)

### ⚠ BREAKING CHANGES

- bump assets-base dependencies to ESM / bigint (#1271)

### Features

- bump assets-base dependencies to ESM / bigint ([#1271](https://github.com/ExodusMovement/exodus-core/issues/1271)) ([7d4df69](https://github.com/ExodusMovement/exodus-core/commit/7d4df69a807e482ea39c9236c48bb39bfc730083))

### Bug Fixes

- remove XTZ specific check ([#1288](https://github.com/ExodusMovement/exodus-core/issues/1288)) ([ba627c3](https://github.com/ExodusMovement/exodus-core/commit/ba627c37fa680379574f80f4a0aba2fc94f00a75))

## [11.19.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/models@11.18.1...@exodus/models@11.18.2) (2024-07-19)

**Note:** Version bump only for package @exodus/models

## [11.18.1](https://github.com/ExodusMovement/exodus-core/compare/@exodus/models@11.18.0...@exodus/models@11.18.1) (2024-07-09)

### Bug Fixes

- use longer exclude pattern in files with a hope that it work ([#1255](https://github.com/ExodusMovement/exodus-core/issues/1255)) ([158d77b](https://github.com/ExodusMovement/exodus-core/commit/158d77b054aa4861d91b4fc58152efa9a6a85577))

## [11.18.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/models@11.17.0...@exodus/models@11.18.0) (2024-07-05)

### Features

- make exodus/models an ESM module ([#1224](https://github.com/ExodusMovement/exodus-core/issues/1224)) ([deb6898](https://github.com/ExodusMovement/exodus-core/commit/deb6898a1826975b7b81a33f4e0ac8c076ac70eb))

## [11.17.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/models@11.16.1...@exodus/models@11.17.0) (2024-06-17)

### Features

- add Onramper provider to `Fiat` model ([#1201](https://github.com/ExodusMovement/exodus-core/issues/1201)) ([0a5b3a5](https://github.com/ExodusMovement/exodus-core/commit/0a5b3a50a3459236fc0f2b39e2d01b9255118edd))

## [11.16.1](https://github.com/ExodusMovement/exodus-core/compare/@exodus/models@11.16.0...@exodus/models@11.16.1) (2024-06-13)

### Bug Fixes

- Fiat order convertion fails if one order cannot be converted ([#1203](https://github.com/ExodusMovement/exodus-core/issues/1203)) ([4d7098d](https://github.com/ExodusMovement/exodus-core/commit/4d7098d5c55c3ddb077323e0ffda5e24d106b06c))

## [11.16.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/models@11.15.0...@exodus/models@11.16.0) (2024-05-14)

### Features

- **fiat-order:** add `initiated` order status ([#1171](https://github.com/ExodusMovement/exodus-core/issues/1171)) ([96475e7](https://github.com/ExodusMovement/exodus-core/commit/96475e75228453ac1dfacbc9a0091d2afbfb8635))

## [11.15.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/models@11.14.0...@exodus/models@11.15.0) (2024-05-14)

### Features

- **fiat:** add blockchain.com to Fiat model ([#1168](https://github.com/ExodusMovement/exodus-core/issues/1168)) ([a48d4a4](https://github.com/ExodusMovement/exodus-core/commit/a48d4a4a84753d875bb9eff256c5023ca76f928d))

## [11.14.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/models@11.13.0...@exodus/models@11.14.0) (2024-05-07)

### Features

- `defaultWith` factory ([#1165](https://github.com/ExodusMovement/exodus-core/issues/1165)) ([6449e1c](https://github.com/ExodusMovement/exodus-core/commit/6449e1c9aa330573857909a6a7a3dfb05853ebb6))

## [11.13.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/models@11.12.0...@exodus/models@11.13.0) (2024-05-06)

### Features

- add isMultisig field to WalletAccount ([#1159](https://github.com/ExodusMovement/exodus-core/issues/1159)) ([3d074d1](https://github.com/ExodusMovement/exodus-core/commit/3d074d163d1d78cea80e1d06912eea278f39456c))

## [11.12.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/models@11.11.0...@exodus/models@11.12.0) (2024-04-02)

### Features

- add filter method to OrderSet ([#1129](https://github.com/ExodusMovement/exodus-core/issues/1129)) ([fd4c9f8](https://github.com/ExodusMovement/exodus-core/commit/fd4c9f8e401d6c105e542d02f228c8d4491b4f55))

### Bug Fixes

- expose seed source on WalletAccount as static ([#1134](https://github.com/ExodusMovement/exodus-core/issues/1134)) ([173504c](https://github.com/ExodusMovement/exodus-core/commit/173504ce5e19c400f9ab30314de0dcbd3d6ffdac))

## [11.11.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/models@11.10.0...@exodus/models@11.11.0) (2024-03-28)

### Features

- toPriorityOrderedArray descending ([#1130](https://github.com/ExodusMovement/exodus-core/issues/1130)) ([1f9c9c2](https://github.com/ExodusMovement/exodus-core/commit/1f9c9c2f2b16568b5b0ee2f4a43576efbad0af82))

# [11.10.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/models@11.9.0...@exodus/models@11.10.0) (2024-03-06)

### Features

- set compatibility mode for hardware wallet accounts ([#1104](https://github.com/ExodusMovement/exodus-core/issues/1104)) ([1b1cc5a](https://github.com/ExodusMovement/exodus-core/commit/1b1cc5a588ecc53e05366372f587e26d261ef462))

# [11.9.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/models@11.8.0...@exodus/models@11.9.0) (2024-02-16)

### Features

- add `seedId` to support seed ids on exodus wallet accounts ([#1082](https://github.com/ExodusMovement/exodus-core/issues/1082)) ([6cab0f7](https://github.com/ExodusMovement/exodus-core/commit/6cab0f7c618a5df350a1b5f244de1e39c45a3704))

# [11.8.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/models@11.7.0...@exodus/models@11.8.0) (2024-02-15)

### Features

- allow `compatibilityMode` on exodus accounts ([#1079](https://github.com/ExodusMovement/exodus-core/issues/1079)) ([d2fb236](https://github.com/ExodusMovement/exodus-core/commit/d2fb236cd5de330465a2975691739259780c3a86))

# [11.7.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/models@11.6.0...@exodus/models@11.7.0) (2024-02-15)

### Features

- add compatibility mode to wallet account ([#1074](https://github.com/ExodusMovement/exodus-core/issues/1074)) ([47d033b](https://github.com/ExodusMovement/exodus-core/commit/47d033b6094edb45b320f4eb65cb55821e84727c))

# [11.6.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/models@11.5.0...@exodus/models@11.6.0) (2024-02-12)

### Features

- walletAccount.isSoftware ([#1055](https://github.com/ExodusMovement/exodus-core/issues/1055)) ([b6af305](https://github.com/ExodusMovement/exodus-core/commit/b6af30536e3137ea2dae16a387cbdf6fdf2085e5))

# [11.5.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/models@11.4.0...@exodus/models@11.5.0) (2024-02-09)

### Features

- WalletAccount 'seed' source ([#1045](https://github.com/ExodusMovement/exodus-core/issues/1045)) ([e7fb9c1](https://github.com/ExodusMovement/exodus-core/commit/e7fb9c15b0a3e7b9bd7e048dad6500d0ad883fcb))

# [11.4.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/models@11.3.2...@exodus/models@11.4.0) (2024-02-07)

### Features

- add failed paypal order status ([#1042](https://github.com/ExodusMovement/exodus-core/issues/1042)) ([a1b7e27](https://github.com/ExodusMovement/exodus-core/commit/a1b7e273f1c4f7edd1ff6830e3347cff501dd026))

## [11.3.2](https://github.com/ExodusMovement/exodus-core/compare/@exodus/models@11.3.1...@exodus/models@11.3.2) (2024-01-31)

### Bug Fixes

- update paypal order stale status ([#1037](https://github.com/ExodusMovement/exodus-core/issues/1037)) ([c484e59](https://github.com/ExodusMovement/exodus-core/commit/c484e5920ef29c2860ecdd1374b6bcc305e98937))

## [11.3.1](https://github.com/ExodusMovement/exodus-core/compare/@exodus/models@11.3.0...@exodus/models@11.3.1) (2024-01-29)

### Bug Fixes

- add paypal provider order statuses ([#1035](https://github.com/ExodusMovement/exodus-core/issues/1035)) ([87ed7d6](https://github.com/ExodusMovement/exodus-core/commit/87ed7d65c515f447fb9407eb06cf8d8804a9e22b))

# [11.3.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/models@11.2.0...@exodus/models@11.3.0) (2024-01-23)

### Features

- prevent instantiating AccountState instances ([#1028](https://github.com/ExodusMovement/exodus-core/issues/1028)) ([15859e2](https://github.com/ExodusMovement/exodus-core/commit/15859e27fdc0551d6d21693b0c3a01eca56694f1))

# [11.2.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/models@11.1.0...@exodus/models@11.2.0) (2023-12-04)

### Features

- **fiat:** test `FiatOrder` equality ([#1016](https://github.com/ExodusMovement/exodus-core/issues/1016)) ([d61958d](https://github.com/ExodusMovement/exodus-core/commit/d61958d9b466660880bae8a918e8c0902b1d4704))

# [11.1.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/models@11.0.0...@exodus/models@11.1.0) (2023-12-04)

### Features

- **fiat:** make FiatOrderSet instances equality comparable ([#1014](https://github.com/ExodusMovement/exodus-core/issues/1014)) ([6af47ed](https://github.com/ExodusMovement/exodus-core/commit/6af47edede989c7ee54b9e29f982d9f61f0b78ed))

## [11.0.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/models@10.1.0...@exodus/models@11.0.0) (2023-10-31)

### ⚠ BREAKING CHANGES

- **fiat:** inject assets in fiat order adapters (#951)

### Features

- **fiat:** inject assets in fiat order adapters ([#951](https://github.com/ExodusMovement/exodus-core/issues/951)) ([f16fe99](https://github.com/ExodusMovement/exodus-core/commit/f16fe99e1817a1f45a27695af3fa7d6c6d22572f))

# [10.1.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/models@10.0.3...@exodus/models@10.1.0) (2023-08-22)

### Features

- **fiat:** fusion order to order adapter ([#939](https://github.com/ExodusMovement/exodus-core/issues/939)) ([#941](https://github.com/ExodusMovement/exodus-core/issues/941)) ([b5b4fe8](https://github.com/ExodusMovement/exodus-core/commit/b5b4fe88322c58fd705306057bc7f927275191e7))

## [10.0.3](https://github.com/ExodusMovement/exodus-core/compare/@exodus/models@10.0.2...@exodus/models@10.0.3) (2023-08-14)

### Bug Fixes

- **fiat:** nullify proto in fiat-order constants ([#928](https://github.com/ExodusMovement/exodus-core/issues/928)) ([29a5077](https://github.com/ExodusMovement/exodus-core/commit/29a507730e3d74a316321dd3b557b99f421895d3))

## [10.0.2](https://github.com/ExodusMovement/exodus-core/compare/@exodus/models@10.0.1...@exodus/models@10.0.2) (2023-07-21)

**Note:** Version bump only for package @exodus/models

## [10.0.1](https://github.com/ExodusMovement/exodus-core/compare/@exodus/models@10.0.0...@exodus/models@10.0.1) (2023-07-07)

### Bug Fixes

- update assertions ([#883](https://github.com/ExodusMovement/exodus-core/issues/883)) ([cdff25b](https://github.com/ExodusMovement/exodus-core/commit/cdff25bb962b2301613588c615c5ac09b05f260a))

## [10.0.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/models@9.0.0...@exodus/models@10.0.0) (2023-06-27)

### ⚠ BREAKING CHANGES

- remove reliance on @exodus/assets from Tx (#592)

### Code Refactoring

- remove reliance on @exodus/assets from Tx ([#592](https://github.com/ExodusMovement/exodus-core/issues/592)) ([7a10fce](https://github.com/ExodusMovement/exodus-core/commit/7a10fceb4c6509abf3f3143fe1f2f84a8fea03f5))

## [9.0.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/models@8.11.1...@exodus/models@9.0.0) (2023-06-08)

### ⚠ BREAKING CHANGES

- remove reliance on @exodus/assets from Order (#778)
- move Tx initialization into constructor and make constructor private (#852)

### Features

- remove "asset" from ParsedTransaction type ([#779](https://github.com/ExodusMovement/exodus-core/issues/779)) ([8ccf501](https://github.com/ExodusMovement/exodus-core/commit/8ccf501671b8deb11509aa40fe1239b14f649fc8))

### Code Refactoring

- move Tx initialization into constructor and make constructor private ([#852](https://github.com/ExodusMovement/exodus-core/issues/852)) ([ee73aa7](https://github.com/ExodusMovement/exodus-core/commit/ee73aa732ae01b9d47343aad48ec7063306c424e))
- remove reliance on @exodus/assets from Order ([#778](https://github.com/ExodusMovement/exodus-core/issues/778)) ([19ec0ea](https://github.com/ExodusMovement/exodus-core/commit/19ec0ea8f567e2ef292ebb99081e21e1c27c9939))

## [8.11.1](https://github.com/ExodusMovement/exodus-core/compare/@exodus/models@8.11.0...@exodus/models@8.11.1) (2023-03-21)

### Features

- array buffer serialization ([#770](https://github.com/ExodusMovement/exodus-core/issues/770)) ([ba68e22](https://github.com/ExodusMovement/exodus-core/commit/ba68e22c9eeb62758659c107b0e60b51cfc03acc))

## NOT-RELEASED-YET

- feat: support Buffer in account state serialization

## 8.10.4 / 2022-09-28

- move error details from `_error` to `errorDetails` to avoid conflicts

## 8.10.3 / 2022-09-28

- store error in order

## 8.10.2 / 2022-09-23

- feat: warn when TxSet mutations return negative balance

## 8.10.1 / 2022-08-04

- `OrderSet.getByTxId` returns orders by `order.txIds`
- refactor: OrderSet, TxSet
- refactor: use minimalistic-assert

## 8.9.1 / 2022-08-04

- add legacy serilization to orders
- validate order amounts are of number unit type
- enable order creation from constructor

## 8.9.0 / 2022-07-26

- feat: add txId to orders
- feat: (de)serialize orders number unit values
- feat: disable creating orders from constructor. Use only fromJSON

- feat: add feeCoinName to tx for later use

## 8.8.0 / 2022-07-06

- chore: update @exodus/assets dep semver
- BREAKING CHANGE! refactor: remove legacy tx fields. Didn't bump major as noone uses these fields anymore

## 8.7.1 / 2022-05-18

- fix: updating mem field in accountState

## 8.7.1 / 2022-05-18

- No code change, rerelease on the master branch

## 8.7.0 / 2022-05-17

- feat: reimplement AccountState with support for in-memory accountMem and separate (de)serialization

## 8.6.0 / 2022-05-16

- feat: (workaround) allow passing assets for deserializing transaction logs

## 8.5.21 / 2021-12-21

- fix: UtxoCollection.fromArray(null) to not break
- feat: add optional displaySvc to order model

## 8.5.20 / 2021-11-24

- fix: TxSet.fromArray() will create an empty TxSet without a warning

## 8.5.19 / 2021-11-24

- fix: Guard tx-set model from non-array argument

## 8.5.18 / 2021-10-29

- add `Order` and `OrderSet` models

## 8.5.17 / 2021-09-30

- `@exodus/models/lib/types` now loads types from production build of `@exodus/currency` instead of local, untranspiled module
  making it work after publishing.

## 8.5.16 / 2021-06-10

- No code changes, just build & publish

## 8.5.15 / 2021-06-10

- Refactor: remove almost all asset specific code from Tx object

## 8.5.14 / 2021-05-28

- Feat: improve performance by using deepEqual in tx-set

## 8.5.13 / 2021-05-18

- Feat: add Agorand Tokens support

## 8.5.12 / 2021-05-17

- Feat: add BSC (BEP20) tokens support

## 8.5.11 / 2021-05-14

- Feat: add wallet custodial flag and ftx support

## 8.5.10 / 2021-04-28

- Feat: extend error object on getMutations throw

## 8.5.9 / 2021-03-19

- Fix: re-release package

## 8.5.8 / 2021-03-18

- Add support for Binance BEP2 tokens

## 8.5.7 / 2021-03-15

- Add support for Quorum ERC20 tokens

## 8.5.6 / 2021-03-08

- Downgrade `@exodus/assets` to 8.0.x

## 8.5.4 / 2021-02-24

- AccountState support parse USDTTRX unit

## 8.5.3 / 2021-02-24

- Bump `@exodus/assets` to 9.0.x

## 8.5.2 / 2021-02-16

- AccountState support post hooks and dateKeys

## 8.5.1 / 2020-12-18

- add solana token support

## 8.5.0 / 2020-12-16

- add WalletAccountSet model
- add .update method in WalletAccount model
- change pinning of @exodus/currency to ^1.0.0

## 8.4.0 / 2020-12-08

- Remove `tx.height` property.
- Add `tx.tokens` array for assets which can move multiple tokens per transaction.

## 8.2.6 / 2020-10-09

- same as 8.3.0, to avoid re-publishing all asset libs that depends on ~8.2.x

## 8.3.0 / 2020-10-09

- add WalletAccount .icon, .color

  8.2.4 / 2020-06-25

---

- Add methods `addUtxo` and `toPriorityOrderedArray` to UtxoCollection needed for desktop

  8.2.3 / 2020-06-04

---

- XTZ unstaking tx forced to "sent" type

  8.2.2 / 2020-05-11

---

- PersonalNote - deep copy `sends`

  8.2.1 / 2020-04-21

---

- PersonalNote - equals support undefined
- PersonalNote - allow message be undefined

  8.2.0 / 2020-03-12

---

- UtxoCollection - add `unionOverwrite` method

  8.1.0 / 2020-03-03

---

- PersonalNote - allow arbitrary fields

  8.0.0 / 2020-01-20

---

- Unify major version to match `@exodus/assets` & `@exodus/assets-base`
- Bump `@exodus/assets` to `8.0.x`

  7.0.0 / 2020-01-02

---

- Bump `@exodus/assets` to `5.0.x`

  6.1.0 / 2019-12-20

---

- Add `types.js.flow` file

  6.0.0 / 2019-11-16

---

- Bump `@exodus/assets` to `5.0.x`

  5.0.1 / 2019-11-13

---

- WalletAccount - add `is2FA` prop

  5.0.0 / 2019-10-21

---

- AccountState - introduce `create`, `contains`, and `merge` methods
- Bump `@exodus/assets` to `4.0.x`

  4.2.2 / 2019-10-02

---

- Add `wallet-account`
- Add `account-state`

  4.1.2 / 2019-09-27

---

- Optimize `tx.update`, `tx.equals`, `tx-set.updateTxsProperties` for calls with no changes

  4.1.1 / 2019-09-13

---

- Tx - cleanup error, meta, token on toJSON if they are the default value
- Tx - addresses stringify correct on toJSON now

  4.1.0 / 2019-09-09

---

- Add `personal-note`
- Add `personal-note-set`

  4.0.3 / 2019-08-22

---

- Fix `tx.dropped` condition when checking for `confirmations`

  4.0.2 / 2019-08-16

---

- Handle `tx.feeAmount` for BTT being a BTT currency (should be TRX)

  4.0.1 / 2019-08-16

---

- Handle `tx.feeAmount` for ONT being an ONG currency

  4.0.0 / 2019-08-14

---

- Add `tx.selfSend`
- Bump `@exodus/assets` to `3.0.x`

  3.0.0 / 2019-08-09

---

- Remove `tx.personalNote`
- Improve `feeAmount` handling for assets that use a different fee currency

  2.2.0 / 2019-08-06

---

- Handle `tx.feeAmount` for NEO being a GAS currency
- Remove `fee-estimator`

  2.1.1 / 2019-07-26

---

- Get rid of the `is-equal` dependency

  2.1.0 / 2019-07-24

---

- Add `tx.from` as an array of addresses
- Remove `tx.outputs`
- Remove `tx.paymentId`
- Rename `tx.memo` to `tx.personalNote`
- Correctly throw when parsing a tx if `tx.addresses` is not a valid type
- Export `TxSet.utils`
- Export `AddressSet.PATH_SORTER`
- Export `Address.utils` and `Address.isAddress`

  2.0.2 / 2019-07-12

---

- utxo-collection: remove .merge's replaceByAddress flag
- utxo-collection: memoize .addresses getter
- address: add .pathArray getter

  2.0.1 / 2019-06-21

---

- `Tx` add parse feeAmount for Tron token

  2.0.0 / 2019-06-11

---

- `@exodus/currency` bump to `1.0.0`
- `@exodus/assets` bump to `2.0.0`

  1.0.2 / 2019-05-13

---

- Give `Tx.data` a default value

  1.0.1 / 2019-05-08

---

- Add `data` field to `Tx`

  1.0.0 / 2019-03-12

---

- `@exodus/assets` to `1.0.0`

## 0.1.4 / 2019-03-01

- `Tx` introduce the concept of a dropped tx
- `TxSet` account for dropped txs

  0.1.3 / 2019-02-07

---

- `UtxosCollection.value` getter now caches.
- `TxSet.getMutations` now accounts for failed txs with an error field.
- `UtxoCollection` now sorts utxos correctly.

  0.1.2 / 2018-12-05

---

- `UtxosCollection/fee-estimator` does not enforce `P2PKH` addresses.

  0.1.1 / 2018-11-27

---

- `UtxoCollection#addresses` now returns an `AddressSet`.
- memoization on `size()`

  0.1.0 / 2018-11-11

---

- upgrade `@exodus/currency` and `@exodus/assets` to ensure we get the version using `big-rational` intstead of `bignnumber.js`
