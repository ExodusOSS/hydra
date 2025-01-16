# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [9.0.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/formatting@9.0.1...@exodus/formatting@9.0.2) (2024-11-25)

### License

- license: re-license under MIT license (#10580)

## [9.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/formatting@9.0.0...@exodus/formatting@9.0.1) (2024-11-01)

### Performance Improvements

- **formatting:** embed and partially refactor format-currency (re-open 8670) ([#9767](https://github.com/ExodusMovement/exodus-hydra/issues/9767)) ([1484f87](https://github.com/ExodusMovement/exodus-hydra/commit/1484f87cdd13bfaf8ecf769ef04ffd0327ad0c2a))

## [9.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/formatting@8.0.2...@exodus/formatting@9.0.0) (2024-10-10)

### ⚠ BREAKING CHANGES

- use min 2 decimals by default for non-zero numbers (#9776)

### Features

- use min 2 decimals by default for non-zero numbers ([#9776](https://github.com/ExodusMovement/exodus-hydra/issues/9776)) ([dc0b2cd](https://github.com/ExodusMovement/exodus-hydra/commit/dc0b2cd297e44b186a03d27ea3f838ec8ab51618))

## [8.0.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/formatting@8.0.1...@exodus/formatting@8.0.2) (2024-10-09)

### Bug Fixes

- allow maxSignificant < 2 ([#9843](https://github.com/ExodusMovement/exodus-hydra/issues/9843)) ([d765e1e](https://github.com/ExodusMovement/exodus-hydra/commit/d765e1ec52f1dd06cea2f89a7e3b0f99cc35a624))

## [8.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/formatting@8.0.0...@exodus/formatting@8.0.1) (2024-10-03)

### Bug Fixes

- handle scientific notation properly ([#9746](https://github.com/ExodusMovement/exodus-hydra/issues/9746)) ([781918b](https://github.com/ExodusMovement/exodus-hydra/commit/781918b160dc1372cadd0653680ba236edd419e0))

## [8.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/formatting@7.0.1...@exodus/formatting@8.0.0) (2024-09-19)

### ⚠ BREAKING CHANGES

- don't display ~ dust sign (#9380)

### Features

- don't display ~ dust sign ([#9380](https://github.com/ExodusMovement/exodus-hydra/issues/9380)) ([4b4200f](https://github.com/ExodusMovement/exodus-hydra/commit/4b4200ff78b77daa6d7534f3096e448ee894b382))

## [7.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/formatting@7.0.0...@exodus/formatting@7.0.1) (2024-09-18)

**Note:** Version bump only for package @exodus/formatting

## [7.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/formatting@6.0.1...@exodus/formatting@7.0.0) (2024-09-17)

### ⚠ BREAKING CHANGES

- add withPlusSign option (#9300)

### Features

- add withPlusSign option ([#9300](https://github.com/ExodusMovement/exodus-hydra/issues/9300)) ([3699894](https://github.com/ExodusMovement/exodus-hydra/commit/3699894b4505225d241e4925a372e65acf71b951))

## [6.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/formatting@6.0.0...@exodus/formatting@6.0.1) (2024-09-10)

### Bug Fixes

- handle negative numbers, decrease dust limit ([#8795](https://github.com/ExodusMovement/exodus-hydra/issues/8795)) ([40a54be](https://github.com/ExodusMovement/exodus-hydra/commit/40a54be17e1a44ba007ca409736b805ae0d75f2d))

## [6.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/formatting@5.0.0...@exodus/formatting@6.0.0) (2024-08-21)

### ⚠ BREAKING CHANGES

- remove trailing zeros from fiat formatters (#8600)
- simplify asset formatter (#8525)
- deprecate old formatPrice and use new api (#8505)

### Features

- deprecate old formatPrice and use new api ([#8505](https://github.com/ExodusMovement/exodus-hydra/issues/8505)) ([b4bff0a](https://github.com/ExodusMovement/exodus-hydra/commit/b4bff0aebd3f09c428ebaefee6e8f4665078535b))
- remove trailing zeros from fiat formatters ([#8600](https://github.com/ExodusMovement/exodus-hydra/issues/8600)) ([a9727a8](https://github.com/ExodusMovement/exodus-hydra/commit/a9727a8f0cfcc43d277e9e3f1a06bd1d901f5976))
- simplify asset formatter ([#8525](https://github.com/ExodusMovement/exodus-hydra/issues/8525)) ([15c1818](https://github.com/ExodusMovement/exodus-hydra/commit/15c18181fb7cb41c78314d49bbeea135341233d4))

## [5.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/formatting@4.0.0...@exodus/formatting@5.0.0) (2024-08-16)

### ⚠ BREAKING CHANGES

- return $0 if fiat amount is zero. fix percentage formatter (#8442)

### Features

- return $0 if fiat amount is zero. fix percentage formatter ([#8442](https://github.com/ExodusMovement/exodus-hydra/issues/8442)) ([54b76b5](https://github.com/ExodusMovement/exodus-hydra/commit/54b76b5b9984520a7c56058ce6fa0dd797f1cfd0))

## [4.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/formatting@3.0.0...@exodus/formatting@4.0.0) (2024-08-13)

### ⚠ BREAKING CHANGES

- remove Intl usage from percentage formatting (#8389)

### Features

- remove Intl usage from percentage formatting ([#8389](https://github.com/ExodusMovement/exodus-hydra/issues/8389)) ([f968a21](https://github.com/ExodusMovement/exodus-hydra/commit/f968a219101e52ea4e607208afed3c5b572dfb66))

## [3.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/formatting@2.0.0...@exodus/formatting@3.0.0) (2024-08-12)

### ⚠ BREAKING CHANGES

- percentages should have 1 decimal by default (#8321)
- format asset amounts max to 6 significant digits (#8323)

### Features

- format asset amounts max to 6 significant digits ([#8323](https://github.com/ExodusMovement/exodus-hydra/issues/8323)) ([3231d72](https://github.com/ExodusMovement/exodus-hydra/commit/3231d72e9464370d8244ce4e86abf8a2a0dd0182))
- percentages should have 1 decimal by default ([#8321](https://github.com/ExodusMovement/exodus-hydra/issues/8321)) ([6deec89](https://github.com/ExodusMovement/exodus-hydra/commit/6deec8999d436cec4d0601d55603cc930c9f113f))

## [2.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/formatting@1.2.1...@exodus/formatting@2.0.0) (2024-08-12)

### ⚠ BREAKING CHANGES

- format dust fiat amount (#8267)

### Features

- add more test to formatting utils ([#8265](https://github.com/ExodusMovement/exodus-hydra/issues/8265)) ([54973ce](https://github.com/ExodusMovement/exodus-hydra/commit/54973ce1a4cf0543889ee60a4d99265f722165d5))
- format dust fiat amount ([#8267](https://github.com/ExodusMovement/exodus-hydra/issues/8267)) ([9346628](https://github.com/ExodusMovement/exodus-hydra/commit/934662889491abcfed97f8c6fa9f10a12a407150))

### Bug Fixes

- remove currency declarations ([#4538](https://github.com/ExodusMovement/exodus-hydra/issues/4538)) ([08a5a63](https://github.com/ExodusMovement/exodus-hydra/commit/08a5a6384962ff638d2cecc713918f8ceb8cce13))

## [1.2.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/formatting@1.2.0...@exodus/formatting@1.2.1) (2023-09-20)

### Bug Fixes

- add missing `exports` and file extensions on imports for ESM compatibility ([#4139](https://github.com/ExodusMovement/exodus-hydra/issues/4139)) ([65ddd22](https://github.com/ExodusMovement/exodus-hydra/commit/65ddd22c280b3641b71dda233c00793f32e8f8af))

## [1.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/formatting@1.1.1...@exodus/formatting@1.2.0) (2023-09-15)

### Features

- add `truncateMiddle` ([#4081](https://github.com/ExodusMovement/exodus-hydra/issues/4081)) ([2d58b94](https://github.com/ExodusMovement/exodus-hydra/commit/2d58b94f09d08ce8e9f3aca9cc8e60596a250ab8))

## [1.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/formatting@1.1.0...@exodus/formatting@1.1.1) (2023-08-30)

### Bug Fixes

- publish as esm packages with type module ([#3643](https://github.com/ExodusMovement/exodus-hydra/issues/3643)) ([5106569](https://github.com/ExodusMovement/exodus-hydra/commit/5106569764f85d38928bdebb912ea74b8240e84f))

## [1.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/formatting@1.0.1...@exodus/formatting@1.1.0) (2023-08-15)

### Features

- extract formatting from platforms ([#3379](https://github.com/ExodusMovement/exodus-hydra/issues/3379)) ([5683af1](https://github.com/ExodusMovement/exodus-hydra/commit/5683af1e104ae36df48eb71309c7349f7c053389))

## [1.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/formatting@1.0.0...@exodus/formatting@1.0.1) (2023-08-02)

**Note:** Version bump only for package @exodus/formatting

## 1.0.0 (2023-05-02)

### Features

- add @exodus/formatting ([#201](https://github.com/ExodusMovement/exodus-hydra/issues/201)) ([e4f5079](https://github.com/ExodusMovement/exodus-hydra/commit/e4f5079f6d1ae242e407d6d8f029c1b03473e768))
- add toSnakeCase ([#1471](https://github.com/ExodusMovement/exodus-hydra/issues/1471)) ([6c5aa0a](https://github.com/ExodusMovement/exodus-hydra/commit/6c5aa0a2341d2bf64e13f226ac6cf17869936844))
- **formatting:** add formatCurrency ([#204](https://github.com/ExodusMovement/exodus-hydra/issues/204)) ([824f04d](https://github.com/ExodusMovement/exodus-hydra/commit/824f04d393f1945489640f1eb905e076dbf33568))
