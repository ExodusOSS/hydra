# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [6.3.1](https://github.com/ExodusMovement/hydra/compare/@exodus/currency@6.3.0...@exodus/currency@6.3.1) (2025-10-21)

### Bug Fixes

- fix: upgrade version of @exodus/bigint used in @exodus/currency (#14175)

## [6.3.0](https://github.com/ExodusMovement/hydra/compare/@exodus/currency@6.2.1...@exodus/currency@6.3.0) (2025-07-24)

### Features

- feat(currency): different-type check only on dev & test (#13334)

## [6.2.1](https://github.com/ExodusMovement/hydra/compare/@exodus/currency@6.2.0...@exodus/currency@6.2.1) (2025-03-04)

### Bug Fixes

- fix: `isInstance` function handling (#11640)

- fix: `isInstance` function handling (#11654)

## [6.2.0](https://github.com/ExodusMovement/hydra/compare/@exodus/currency@6.1.0...@exodus/currency@6.2.0) (2025-02-28)

### Features

- feat: introduce `NumberUnit.isInstance` (#11619)

## [6.1.0](https://github.com/ExodusMovement/hydra/compare/@exodus/currency@6.0.2...@exodus/currency@6.1.0) (2024-12-02)

### Features

- feat: export `isUnitType` (#10621)

### License

- license: re-license under MIT license (#10339)

## [6.0.3](https://github.com/ExodusMovement/hydra/compare/@exodus/currency@6.0.2...@exodus/currency@6.0.3) (2024-11-25)

### License

- license: re-license under MIT license (#10339)

## [6.0.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/currency@6.0.1...@exodus/currency@6.0.2) (2024-11-18)

**Note:** Version bump only for package @exodus/currency

## [6.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/currency@6.0.0...@exodus/currency@6.0.1) (2024-09-27)

### Bug Fixes

- unit type improvements ([#8782](https://github.com/ExodusMovement/exodus-hydra/issues/8782)) ([af235e8](https://github.com/ExodusMovement/exodus-hydra/commit/af235e83cbaa5e3fbb0847da9d577d2606722c93))

## 6.0.0 (2024-09-19)

### ⚠ BREAKING CHANGES

- switch exodus/currency from CJS to ESM (#1231)
- make bigint always native, switch it ESM (#1232)
- bn.js and bigint constructor compatibility (#1139)
- abstract bigint from NumberUnit, implement native-bigint support (#954)

### Features

- abstract bigint from NumberUnit, implement native-bigint support ([#954](https://github.com/ExodusMovement/exodus-hydra/issues/954)) ([0cadd40](https://github.com/ExodusMovement/exodus-hydra/commit/0cadd40b2067d5ee678b88f012a79ac3bcfad998))
- add cast method to number unit ([#495](https://github.com/ExodusMovement/exodus-hydra/issues/495)) ([29c9192](https://github.com/ExodusMovement/exodus-hydra/commit/29c91927daac439c53a87c7017552fb879fb09ed))
- add currency isPositive method to NumberUnit ([#261](https://github.com/ExodusMovement/exodus-hydra/issues/261)) ([cc5dc85](https://github.com/ExodusMovement/exodus-hydra/commit/cc5dc8506f438fdef29ce6e7f67dc0929f031a53))
- add option to specify showing unit with toString aliases ([#448](https://github.com/ExodusMovement/exodus-hydra/issues/448)) ([083919d](https://github.com/ExodusMovement/exodus-hydra/commit/083919d4bfebd021c3c461423bf8ee6d67db14de))
- allow specifying unit for toNumber & toString ([#432](https://github.com/ExodusMovement/exodus-hydra/issues/432)) ([30e8d4d](https://github.com/ExodusMovement/exodus-hydra/commit/30e8d4d4571acc923187205e99ce217c8832b3e1))
- allow string value with 'unitInstance' parameter. ([#603](https://github.com/ExodusMovement/exodus-hydra/issues/603)) ([bce926c](https://github.com/ExodusMovement/exodus-hydra/commit/bce926c78e934da4d349d3c0ea9c7b5cee0c1a12))
- **currency:** add createFromBaseValue ([#602](https://github.com/ExodusMovement/exodus-hydra/issues/602)) ([d78cc3d](https://github.com/ExodusMovement/exodus-hydra/commit/d78cc3d7a0e0b85bdffdfe47d073786393831ef6))
- **currency:** add nu.toBaseBufferLE() and toBaseBufferBE() ([#306](https://github.com/ExodusMovement/exodus-hydra/issues/306)) ([51530be](https://github.com/ExodusMovement/exodus-hydra/commit/51530be0f3191702e0a1a71809d89d715920822f))
- **currency:** add types file to output ([#937](https://github.com/ExodusMovement/exodus-hydra/issues/937)) ([5309408](https://github.com/ExodusMovement/exodus-hydra/commit/5309408ad5eab470d9a61b69bd3c8be46ab974b3))
- make bigint always native, switch it ESM ([#1232](https://github.com/ExodusMovement/exodus-hydra/issues/1232)) ([1f4797e](https://github.com/ExodusMovement/exodus-hydra/commit/1f4797e90f864384f95e50fc66685aaf6f407b20))
- memoize UnitType creation ([#774](https://github.com/ExodusMovement/exodus-hydra/issues/774)) ([cbb1878](https://github.com/ExodusMovement/exodus-hydra/commit/cbb18781e89794c11381516dcdc1e56e15933f1d))
- **number-unit:** warn for wrong unitTypes and improve toDefault perf ([#433](https://github.com/ExodusMovement/exodus-hydra/issues/433)) ([b072d5c](https://github.com/ExodusMovement/exodus-hydra/commit/b072d5cb4563b0e2be68e08575bd969426d6f348))
- switch exodus/currency from CJS to ESM ([#1231](https://github.com/ExodusMovement/exodus-hydra/issues/1231)) ([bd7cec7](https://github.com/ExodusMovement/exodus-hydra/commit/bd7cec735e4e352d0d9410ccc0249b09c5d54aca))
- throw in dev/test mode when unit types mismatch ([#1169](https://github.com/ExodusMovement/exodus-hydra/issues/1169)) ([d343da3](https://github.com/ExodusMovement/exodus-hydra/commit/d343da33791fb977560aa4ba7e8071c3cc63a3b3))

### Bug Fixes

- bn.js and bigint constructor compatibility ([#1139](https://github.com/ExodusMovement/exodus-hydra/issues/1139)) ([3173008](https://github.com/ExodusMovement/exodus-hydra/commit/31730086d7f5eed381b7e8702bd828ac47ae13f9))
- bump bn.js@5.2.1 ([#1087](https://github.com/ExodusMovement/exodus-hydra/issues/1087)) ([7a2524b](https://github.com/ExodusMovement/exodus-hydra/commit/7a2524ba8c0b8d9b533fe9979e3b7cda5a902bba))
- **currency:** deprecate fields in types ([#948](https://github.com/ExodusMovement/exodus-hydra/issues/948)) ([00cc455](https://github.com/ExodusMovement/exodus-hydra/commit/00cc455585da5756f5048e3ba4dde6e51030f631))
- **currency:** UnitType.ZERO type ([#979](https://github.com/ExodusMovement/exodus-hydra/issues/979)) ([8adeb8c](https://github.com/ExodusMovement/exodus-hydra/commit/8adeb8cb4017ca0cfa7d8b35bee9da8ca30078e9))
- **currency:** use positional arguments for conversionByRate function ([#1157](https://github.com/ExodusMovement/exodus-hydra/issues/1157)) ([f6e007a](https://github.com/ExodusMovement/exodus-hydra/commit/f6e007aa0b2b1e8aff8287580fa459862a197c32))
- don't allow to see \_numberString in cycles ([#394](https://github.com/ExodusMovement/exodus-hydra/issues/394)) ([a127abd](https://github.com/ExodusMovement/exodus-hydra/commit/a127abdcdf89b545b3ec5286423fc9d817d037aa))
- expose units ([#962](https://github.com/ExodusMovement/exodus-hydra/issues/962)) ([2f5389b](https://github.com/ExodusMovement/exodus-hydra/commit/2f5389b05d341cbb951d6c59a8e3b811ce9f719d))
- improve isNumberUnit check ([#9307](https://github.com/ExodusMovement/exodus-hydra/issues/9307)) ([29b32d8](https://github.com/ExodusMovement/exodus-hydra/commit/29b32d81505a95b46ee182e4a8329ead6e725fd7))
- number-unit.add/sub deprecated usage. ([#464](https://github.com/ExodusMovement/exodus-hydra/issues/464)) ([e562fe0](https://github.com/ExodusMovement/exodus-hydra/commit/e562fe0a371191cfa97176fd78ee35f6db4dff9b))
- **NumberUnit:** pass NumberUnit to mul ([#1117](https://github.com/ExodusMovement/exodus-hydra/issues/1117)) ([bb71ad7](https://github.com/ExodusMovement/exodus-hydra/commit/bb71ad7bd7adfa5597ecb33c57d6bde5df706b44))
- remove bn.js dep from /currency ([#1267](https://github.com/ExodusMovement/exodus-hydra/issues/1267)) ([c1e73e9](https://github.com/ExodusMovement/exodus-hydra/commit/c1e73e9e464d093d27d0b7e53f6201e6a427ef1a))
- types for optional parameters ([#969](https://github.com/ExodusMovement/exodus-hydra/issues/969)) ([ea02eb6](https://github.com/ExodusMovement/exodus-hydra/commit/ea02eb602c9471fd4f6d78be3ed7f38d721376d1))
- unit type ([#960](https://github.com/ExodusMovement/exodus-hydra/issues/960)) ([662e120](https://github.com/ExodusMovement/exodus-hydra/commit/662e120c10984d645eeecb269a2e7c58f1efc4f4))
- use checksummed eth addresses ([#460](https://github.com/ExodusMovement/exodus-hydra/issues/460)) ([6d4d510](https://github.com/ExodusMovement/exodus-hydra/commit/6d4d510d71754c7f83bb95d43cc929ae37d28dcb))
- use longer exclude pattern in files with a hope that it work ([#1255](https://github.com/ExodusMovement/exodus-hydra/issues/1255)) ([de63e2e](https://github.com/ExodusMovement/exodus-hydra/commit/de63e2efe5131cffbd931cae55e7c888dbc49a20))

### Performance Improvements

- return same instance of zero for unit type ([#629](https://github.com/ExodusMovement/exodus-hydra/issues/629)) ([9613e60](https://github.com/ExodusMovement/exodus-hydra/commit/9613e60f6d92f75e1451dc69fede4a0a25644ed6))

## [5.0.2](https://github.com/ExodusMovement/exodus-core/compare/@exodus/currency@5.0.1...@exodus/currency@5.0.2) (2024-07-11)

### Bug Fixes

- remove bn.js dep from /currency ([#1267](https://github.com/ExodusMovement/exodus-core/issues/1267)) ([60f4db9](https://github.com/ExodusMovement/exodus-core/commit/60f4db9507ab49c6ca2ef0750a0a39e80caaebd8))

## [5.0.1](https://github.com/ExodusMovement/exodus-core/compare/@exodus/currency@5.0.0...@exodus/currency@5.0.1) (2024-07-09)

### Bug Fixes

- use longer exclude pattern in files with a hope that it work ([#1255](https://github.com/ExodusMovement/exodus-core/issues/1255)) ([158d77b](https://github.com/ExodusMovement/exodus-core/commit/158d77b054aa4861d91b4fc58152efa9a6a85577))

## [5.0.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/currency@4.1.0...@exodus/currency@5.0.0) (2024-07-06)

### ⚠ BREAKING CHANGES

- make bigint always native, switch it ESM (#1232)

### Features

- make bigint always native, switch it ESM ([#1232](https://github.com/ExodusMovement/exodus-core/issues/1232)) ([ffbeb9d](https://github.com/ExodusMovement/exodus-core/commit/ffbeb9d73dcb89d34667d6d7f8db14139dbb7b12))

## [4.1.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/currency@4.0.1...@exodus/currency@4.1.0) (2024-05-13)

### Features

- throw in dev/test mode when unit types mismatch ([#1169](https://github.com/ExodusMovement/exodus-core/issues/1169)) ([252a3b1](https://github.com/ExodusMovement/exodus-core/commit/252a3b1c3877a901aa35e9e53db284e575f86045))

## [4.0.1](https://github.com/ExodusMovement/exodus-core/compare/@exodus/currency@4.0.0...@exodus/currency@4.0.1) (2024-04-29)

### Bug Fixes

- **currency:** use positional arguments for conversionByRate function ([#1157](https://github.com/ExodusMovement/exodus-core/issues/1157)) ([81404ac](https://github.com/ExodusMovement/exodus-core/commit/81404ac2fa33eff24745237505fc258613d5110e))

## [4.0.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/currency@3.0.1...@exodus/currency@4.0.0) (2024-04-04)

### ⚠ BREAKING CHANGES

- bn.js and bigint constructor compatibility (#1139)

### Bug Fixes

- bn.js and bigint constructor compatibility ([#1139](https://github.com/ExodusMovement/exodus-core/issues/1139)) ([9c5f46c](https://github.com/ExodusMovement/exodus-core/commit/9c5f46c0cc57ed5e097fc8e7a8b9f5ea9ace1ed9))

## [3.0.1](https://github.com/ExodusMovement/exodus-core/compare/@exodus/currency@3.0.0...@exodus/currency@3.0.1) (2024-03-28)

### Bug Fixes

- **NumberUnit:** pass NumberUnit to mul ([#1117](https://github.com/ExodusMovement/exodus-core/issues/1117)) ([472a92f](https://github.com/ExodusMovement/exodus-core/commit/472a92f280fa405bae0ec74591f29b42dab49c48))

## [3.0.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/currency@2.3.3...@exodus/currency@3.0.0) (2024-03-22)

### ⚠ BREAKING CHANGES

- abstract bigint from NumberUnit, implement native-bigint support (#954)

### Features

- abstract bigint from NumberUnit, implement native-bigint support ([#954](https://github.com/ExodusMovement/exodus-core/issues/954)) ([f433a69](https://github.com/ExodusMovement/exodus-core/commit/f433a695d1cda302fc0e02f523c5a49e7003bdfd))
- allow string value with 'unitInstance' parameter. ([#603](https://github.com/ExodusMovement/exodus-core/issues/603)) ([2f63bee](https://github.com/ExodusMovement/exodus-core/commit/2f63beeeb1955d80b61b07392fcf91240ab16d11))

## [2.3.3](https://github.com/ExodusMovement/exodus-core/compare/@exodus/currency@2.3.2...@exodus/currency@2.3.3) (2024-02-22)

### Bug Fixes

- bump bn.js@5.2.1 ([#1087](https://github.com/ExodusMovement/exodus-core/issues/1087)) ([b073e12](https://github.com/ExodusMovement/exodus-core/commit/b073e12ef34c98dcf0546ce097d9808fbd10e9b2))
- **currency:** UnitType.ZERO type ([#979](https://github.com/ExodusMovement/exodus-core/issues/979)) ([c0101c1](https://github.com/ExodusMovement/exodus-core/commit/c0101c1c72cb827d3d94c2c55701cdb1b5ae1659))
- types for optional parameters ([#969](https://github.com/ExodusMovement/exodus-core/issues/969)) ([ae4f294](https://github.com/ExodusMovement/exodus-core/commit/ae4f29400930057a7fcd082fbd232655f442bff8))

## [2.3.2](https://github.com/ExodusMovement/exodus-core/compare/@exodus/currency@2.3.0...@exodus/currency@2.3.2) (2023-09-21)

### Bug Fixes

- export type not interface ([#965](https://github.com/ExodusMovement/exodus-core/issues/965)) ([e7ce014](https://github.com/ExodusMovement/exodus-core/commit/e7ce014c0bf4c45280e72c79a74b29fd45bbb2d3))

## [2.3.1](https://github.com/ExodusMovement/exodus-core/compare/@exodus/currency@2.3.0...@exodus/currency@2.3.1) (2023-09-21)

### Bug Fixes

- expose units ([#962](https://github.com/ExodusMovement/exodus-core/issues/962)) ([e226ad7](https://github.com/ExodusMovement/exodus-core/commit/e226ad7c7570134e3ca356329e587394d56e4757))
- unit type ([#960](https://github.com/ExodusMovement/exodus-core/issues/960)) ([c3742d1](https://github.com/ExodusMovement/exodus-core/commit/c3742d15b1cc6a1afe07987b9045921e75f1a9c0))

# [2.3.0](https://github.com/ExodusMovement/exodus-core/compare/@exodus/currency@2.2.0...@exodus/currency@2.3.0) (2023-08-29)

### Bug Fixes

- **currency:** deprecate fields in types ([#948](https://github.com/ExodusMovement/exodus-core/issues/948)) ([399eb33](https://github.com/ExodusMovement/exodus-core/commit/399eb332d0852408c14a7f43041686c7f8fd9635))

### Features

- **currency:** add types file to output ([#937](https://github.com/ExodusMovement/exodus-core/issues/937)) ([a0f3371](https://github.com/ExodusMovement/exodus-core/commit/a0f337154f96f5c95703355aa547040ab07fd36f))

## 2.2.0 (2023-04-04)

### Features

- memoize UnitType creation ([#774](https://github.com/ExodusMovement/exodus-core/issues/774)) ([abef6f1](https://github.com/ExodusMovement/exodus-core/commit/abef6f1cea3fd0854ddb817816427ef3ee19fc99))

### Performance Improvements

- return same instance of zero for unit type ([#629](https://github.com/ExodusMovement/exodus-core/issues/629)) ([8f754c3](https://github.com/ExodusMovement/exodus-core/commit/8f754c33592a3b539cd0d2008f0d1c0a36ab4aa0))

## 2.1.3 / 2022-09-20

### Features

- **currency:** add createFromBaseValue ([#602](https://github.com/ExodusMovement/exodus-core/issues/602)) ([287a601](https://github.com/ExodusMovement/exodus-core/commit/287a601c0268286b99085cbaa0357c4c8523e3c5))

## 2.1.2 / 2022-05-17

- add static UnitType equality check

## 2.1.1 / 2022-05-17

- invalid release

## 2.1.0 / 2022-04-04

- add UnitType.cast method
- update missing flow types

## 2.0.0 / 2022-02-04

- add UnitType.equals method
- breaking change: use UnitType.equals instead of ref check in NumberUnit and TxSet

## 1.1.6 / 2021-10-25

- Add option to specify showing unit with toString aliases

## 1.1.5 / 2021-10-07

- Add extra logs/warnings to NumberUnit
- prevent crash on NumberUnit clones that are not a NumberUnit instance

## 1.1.4 / 2021-09-30

- Flow types are now packaged and available as `@exodus/currency/lib/types`.

## 1.1.3 / 2021-09-28

- `toString`, `toNumberString`, and `toNumber` now accept an optional unit argument (unitInstance for toString, unit was already taken)
- deprecate direct `toNumberString` usage

## 1.1.2 / 2021-06-28

- `toNumberString` is not iterable now

## 1.1.1 / 2021-06-21

- memoize `toNumberString` method

## 1.1.0 / 2020-12-22

- Add `numberUnit.isPositive` getter method
- Add `numberUnit.toBaseBufferLE` and `numberUnit.toBaseBufferBE` methods

## 1.0.4 / 2019-06-22

- Add `number-unit.div`
- Use `number-unit.div` in `conversion-by-rate` to avoid using `parseFloat`

  1.0.3 / 2019-06-21

---

- Remove `unitType` from `unit`'s `toJSON` output to prevent cyclic errors.

  1.0.2 / 2019-06-19

---

- Parameter type checking in conversion-by-rate
- `number-unit` explicitly check for the `Infinity` cases and throw an error

  1.0.1 / 2019-06-12

---

- Switch unit.toJSON's output to include `power` instead of `multiplier`. This change might have needed a minor bump but I'm including it in a patch because `1.0.0` is unused at this point.

  1.0.0 / 2019-06-11

---

- Switch to `BN.js` from `big-rational` for the underlying representation of values.
- Add support for coercing params to number-unit for the add/sub methods, but with a deprecation warning.
- Add `conversion-by-rate`

  0.1.2 / 2018-11-14

---

- explicitly support numbers represented as hex strings

  0.1.1 / 2018-11-11

---

- fix `conversion` due to upgrade to `big-rational`

  0.1.0 / 2018-11-11

---

Using `big-rational` instead of `bignumber.js` for the underlying representation of values.

## 0.0.1 / 2018-10-25

Initial release that mostly matched what was in Exodus.
