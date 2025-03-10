# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [13.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@13.1.1...@exodus/fiat-balances@13.2.0) (2025-03-04)

### Features

- feat: add `createConversions` selector (#11655)

## [13.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@13.1.0...@exodus/fiat-balances@13.1.1) (2025-02-21)

### Bug Fixes

- fix: skip exporting most reports if wallet doesn't exist (#11553)

## [13.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@13.0.2...@exodus/fiat-balances@13.1.0) (2025-02-21)

### Features

- feat: add placeholder types files (#11228)

### Bug Fixes

- fix: don't export hardware wallet account balances (#11551)

## [13.0.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@13.0.1...@exodus/fiat-balances@13.0.2) (2025-01-20)

### Bug Fixes

- fix(fiat-balances): assets with balance above favorite assets on sort (#11117)

## [13.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@13.0.0...@exodus/fiat-balances@13.0.1) (2025-01-02)

### Bug Fixes

- fix: memoize selector result (#10901)

## [13.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@12.5.2...@exodus/fiat-balances@13.0.0) (2024-12-23)

### ⚠ BREAKING CHANGES

- **fiat-balances:** forward configs from feature (#10818)

### Features

- feat(fiat-balances)!: forward configs from feature (#10818)

### Bug Fixes

- fix: optimistic loaded state (#10920)

## [12.5.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@12.5.1...@exodus/fiat-balances@12.5.2) (2024-12-06)

### License

- license: re-license under MIT license (#10355)

## [12.5.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@12.5.0...@exodus/fiat-balances@12.5.1) (2024-11-29)

### Bug Fixes

- fix: balances map equality check (#10620)

## [12.5.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@12.4.0...@exodus/fiat-balances@12.5.0) (2024-11-29)

### Features

- feat: add various crypto balance props (#10419)

## [12.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@12.3.0...@exodus/fiat-balances@12.4.0) (2024-11-26)

### Features

- feat(fiat-balances): optimisticLoaded selector (#10550)

- feat: use formatting v9 (#9903)

## [12.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@12.2.0...@exodus/fiat-balances@12.3.0) (2024-10-07)

### Features

- use atoms v9 ([#9651](https://github.com/ExodusMovement/exodus-hydra/issues/9651)) ([524aa61](https://github.com/ExodusMovement/exodus-hydra/commit/524aa61f69c81e6ac00b2f94ea830688a105b3e4))

### Bug Fixes

- base assets without balance should be lower than tokens with balance ([#9815](https://github.com/ExodusMovement/exodus-hydra/issues/9815)) ([5e9be7d](https://github.com/ExodusMovement/exodus-hydra/commit/5e9be7d1e5647230ab6dab79592c511312f62eff))

## [12.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@12.1.4...@exodus/fiat-balances@12.2.0) (2024-09-20)

### Features

- use formatting v7 ([#9321](https://github.com/ExodusMovement/exodus-hydra/issues/9321)) ([83b1d31](https://github.com/ExodusMovement/exodus-hydra/commit/83b1d311204adcf03e33377f19ff980c8e8cceda))

## [12.1.4](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@12.1.3...@exodus/fiat-balances@12.1.4) (2024-09-16)

### Bug Fixes

- **fiat-balances:** adjust optimistic balances with fallback selector ([#9298](https://github.com/ExodusMovement/exodus-hydra/issues/9298)) ([c67bc9e](https://github.com/ExodusMovement/exodus-hydra/commit/c67bc9e71be3002d81e09c28f4b4daa9425ebbc7))

## [12.1.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@12.1.2...@exodus/fiat-balances@12.1.3) (2024-09-09)

**Note:** Version bump only for package @exodus/fiat-balances

## [12.1.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@12.1.1...@exodus/fiat-balances@12.1.2) (2024-08-26)

### Performance Improvements

- don't sort arrays without need ([#3183](https://github.com/ExodusMovement/exodus-hydra/pull/8665) ([ac79f66](https://github.com/ExodusMovement/exodus-hydra/commit/ac79f662e48c3e4262f4aed33d72ef77d485f6d4))

## [12.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@12.1.0...@exodus/fiat-balances@12.1.1) (2024-08-23)

### Bug Fixes

- no combinedAssets case ([#8653](https://github.com/ExodusMovement/exodus-hydra/issues/8653)) ([82fb4ed](https://github.com/ExodusMovement/exodus-hydra/commit/82fb4ed31147ee28994350204dab0a60eea5e296))

## [12.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@12.0.0...@exodus/fiat-balances@12.1.0) (2024-08-23)

### Features

- upgrade formatting lib ([#8628](https://github.com/ExodusMovement/exodus-hydra/issues/8628)) ([5b60628](https://github.com/ExodusMovement/exodus-hydra/commit/5b60628586bf734933b46742f2bbe49174ffd6f9))

## [12.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@11.1.0...@exodus/fiat-balances@12.0.0) (2024-08-16)

### ⚠ BREAKING CHANGES

- return $0 if fiat amount is zero. fix percentage formatter (#8442)

### Features

- bump formatting to v4 ([#8404](https://github.com/ExodusMovement/exodus-hydra/issues/8404)) ([df68f5e](https://github.com/ExodusMovement/exodus-hydra/commit/df68f5e3e853200efdfd018c17809f5cd7598ea3))
- return $0 if fiat amount is zero. fix percentage formatter ([#8442](https://github.com/ExodusMovement/exodus-hydra/issues/8442)) ([54b76b5](https://github.com/ExodusMovement/exodus-hydra/commit/54b76b5b9984520a7c56058ce6fa0dd797f1cfd0))

## [11.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@11.0.0...@exodus/fiat-balances@11.1.0) (2024-08-13)

### Features

- add usd conversions selectors ([#8309](https://github.com/ExodusMovement/exodus-hydra/issues/8309)) ([4ec1152](https://github.com/ExodusMovement/exodus-hydra/commit/4ec11524a5ef186b0d5f4f08e537f8257b4c8644))

## [11.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@10.13.2...@exodus/fiat-balances@11.0.0) (2024-08-12)

### ⚠ BREAKING CHANGES

- convert fiat dust value in selector to ~0 (#8320)

### Features

- convert fiat dust value in selector to ~0 ([#8320](https://github.com/ExodusMovement/exodus-hydra/issues/8320)) ([78d9126](https://github.com/ExodusMovement/exodus-hydra/commit/78d91269ffb909134da391bfd98ef34915ae4b37))

## [10.13.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@10.13.1...@exodus/fiat-balances@10.13.2) (2024-08-06)

### Bug Fixes

- default config ([#8225](https://github.com/ExodusMovement/exodus-hydra/issues/8225)) ([73f636c](https://github.com/ExodusMovement/exodus-hydra/commit/73f636caaf471fe82a337788fbbc40fc17ab1475))

## [10.13.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@10.13.0...@exodus/fiat-balances@10.13.1) (2024-08-06)

### Bug Fixes

- jsdoc for fiat-balances ([#8210](https://github.com/ExodusMovement/exodus-hydra/issues/8210)) ([efa44d0](https://github.com/ExodusMovement/exodus-hydra/commit/efa44d07aa63abc3ec3fa728157bd5faed921f88))

## [10.13.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@10.12.4...@exodus/fiat-balances@10.13.0) (2024-07-29)

### Features

- **fiat-balances:** add fiat-balances report node ([#8103](https://github.com/ExodusMovement/exodus-hydra/issues/8103)) ([e48da5f](https://github.com/ExodusMovement/exodus-hydra/commit/e48da5f31e2162259ae04fb6ba282fbcaa6076f8))

## [10.12.4](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@10.12.3...@exodus/fiat-balances@10.12.4) (2024-07-25)

### Bug Fixes

- migrate definitions ([#8030](https://github.com/ExodusMovement/exodus-hydra/issues/8030)) ([d2dfde5](https://github.com/ExodusMovement/exodus-hydra/commit/d2dfde55dfa843eb52842f64b3aac3a6f9a59069))

## [10.12.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@10.12.2...@exodus/fiat-balances@10.12.3) (2024-07-18)

**Note:** Version bump only for package @exodus/fiat-balances

## [10.12.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@10.12.1...@exodus/fiat-balances@10.12.2) (2024-07-17)

### Bug Fixes

- **fiat-balances:** add default config for fiat-balances ([#7911](https://github.com/ExodusMovement/exodus-hydra/issues/7911)) ([c31cb59](https://github.com/ExodusMovement/exodus-hydra/commit/c31cb59f2c3f13257c3712d918741187be8f28a3))

## [10.12.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@10.12.0...@exodus/fiat-balances@10.12.1) (2024-07-11)

**Note:** Version bump only for package @exodus/fiat-balances

## [10.12.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@10.11.0...@exodus/fiat-balances@10.12.0) (2024-06-18)

### Features

- add optimisticByBaseAssetInActiveAccount selector ([#7420](https://github.com/ExodusMovement/exodus-hydra/issues/7420)) ([c4abf1f](https://github.com/ExodusMovement/exodus-hydra/commit/c4abf1f7afb58c306e1f0209ced7196a9bc6a3b9))

## [10.11.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@10.10.0...@exodus/fiat-balances@10.11.0) (2024-05-29)

### Features

- fuel threshold selectors ([#7161](https://github.com/ExodusMovement/exodus-hydra/issues/7161)) ([a6cf8d7](https://github.com/ExodusMovement/exodus-hydra/commit/a6cf8d7fcea6590e2ebbd0da11d51922a8620d78))

## [10.10.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@10.9.0...@exodus/fiat-balances@10.10.0) (2024-05-24)

### Features

- selectors to sort assets by optimistic balance ([#7101](https://github.com/ExodusMovement/exodus-hydra/issues/7101)) ([c0ce032](https://github.com/ExodusMovement/exodus-hydra/commit/c0ce0324d5c587fb9b3abd894503f0be1d02de33))

## [10.9.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@10.8.1...@exodus/fiat-balances@10.9.0) (2024-05-21)

### Features

- add optimised conversion rate selector ([#7046](https://github.com/ExodusMovement/exodus-hydra/issues/7046)) ([691b05b](https://github.com/ExodusMovement/exodus-hydra/commit/691b05bbbe644b9114265f71c34929ff3a5ca86f))

## [10.8.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@10.8.0...@exodus/fiat-balances@10.8.1) (2024-05-13)

### Bug Fixes

- params order ([#6920](https://github.com/ExodusMovement/exodus-hydra/issues/6920)) ([7850d94](https://github.com/ExodusMovement/exodus-hydra/commit/7850d949d1aac1e1513aab72744dea5e9bb599cd))

## [10.8.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@10.7.1...@exodus/fiat-balances@10.8.0) (2024-05-13)

### Features

- make trustedUnverifiedTokens and removedTokens optional ([#6904](https://github.com/ExodusMovement/exodus-hydra/issues/6904)) ([f057013](https://github.com/ExodusMovement/exodus-hydra/commit/f057013e1c3ea4b4ba958a358a090d24398567ef))

## [10.7.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@10.7.0...@exodus/fiat-balances@10.7.1) (2024-05-03)

### Bug Fixes

- export shared folder ([#6801](https://github.com/ExodusMovement/exodus-hydra/issues/6801)) ([69ff0fc](https://github.com/ExodusMovement/exodus-hydra/commit/69ff0fc3d55f1b8acb9f6d1c99a4823cd972d870))

## [10.7.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@10.6.0...@exodus/fiat-balances@10.7.0) (2024-05-02)

### Features

- conversions selector ([#6751](https://github.com/ExodusMovement/exodus-hydra/issues/6751)) ([91c17fa](https://github.com/ExodusMovement/exodus-hydra/commit/91c17fab578b15e028e2d0ffdc283bec2ad6c7c4))

## [10.6.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@10.5.0...@exodus/fiat-balances@10.6.0) (2024-04-23)

### Features

- add more withParentCombined fiat-balance selectors ([#6585](https://github.com/ExodusMovement/exodus-hydra/issues/6585)) ([d25f7a6](https://github.com/ExodusMovement/exodus-hydra/commit/d25f7a6a27ea3fafa47cd3d48b950ec210fb36ac))

## [10.5.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@10.4.1...@exodus/fiat-balances@10.5.0) (2024-03-21)

### Features

- new balances selectors ([#6083](https://github.com/ExodusMovement/exodus-hydra/issues/6083)) ([cd369d2](https://github.com/ExodusMovement/exodus-hydra/commit/cd369d2a9dab3666bcb789c3ebf9e13b8059e634))

## [10.4.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@10.4.0...@exodus/fiat-balances@10.4.1) (2024-03-08)

### Bug Fixes

- re-calc fiat balances ([#6037](https://github.com/ExodusMovement/exodus-hydra/issues/6037)) ([846b255](https://github.com/ExodusMovement/exodus-hydra/commit/846b25581c07928a2d4775b0f2e8fdd674b45981))

## [10.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@10.3.0...@exodus/fiat-balances@10.4.0) (2024-02-28)

### Features

- add fiatBalances default config ([#5906](https://github.com/ExodusMovement/exodus-hydra/issues/5906)) ([ffa55e4](https://github.com/ExodusMovement/exodus-hydra/commit/ffa55e4abade224643266febf60fc0ce248318a6))

## [10.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@10.2.0...@exodus/fiat-balances@10.3.0) (2024-01-17)

### Features

- add `createSortAssetsSelectorFactory` ([#5318](https://github.com/ExodusMovement/exodus-hydra/issues/5318)) ([9b00478](https://github.com/ExodusMovement/exodus-hydra/commit/9b0047859a7d8cc9769a947a915411b1c1accec6))
- add `sortedAssetsWithBalanceInActiveAccount` selector ([#5393](https://github.com/ExodusMovement/exodus-hydra/issues/5393)) ([d5bdf3f](https://github.com/ExodusMovement/exodus-hydra/commit/d5bdf3f99bbf2bf39c158b176aaebc2d47830da5))
- add `sortedAssetsWithoutParentCombinedInActiveAccount` selector ([#5391](https://github.com/ExodusMovement/exodus-hydra/issues/5391)) ([c1fe9b2](https://github.com/ExodusMovement/exodus-hydra/commit/c1fe9b2ccea0804e6288c6a52a858b9148ddf1b2))
- add `sortedAssetsWithTotalBalanceSelector` ([#5394](https://github.com/ExodusMovement/exodus-hydra/issues/5394)) ([eeda3e4](https://github.com/ExodusMovement/exodus-hydra/commit/eeda3e4859e8afa7665e4f7ea9211aa6aa571635))
- add `sortedEnabledAssetsWithBalanceInActiveAccount` ([#5396](https://github.com/ExodusMovement/exodus-hydra/issues/5396)) ([21aeaa5](https://github.com/ExodusMovement/exodus-hydra/commit/21aeaa5c75a2834fb1c1845f5c1ed472e36b0c69))
- add `sortedEnabledAssetsWithTotalBalanceSelector` ([#5397](https://github.com/ExodusMovement/exodus-hydra/issues/5397)) ([da3b3aa](https://github.com/ExodusMovement/exodus-hydra/commit/da3b3aaf3515361617e295bcebb50bbfd7e976a7))

### Bug Fixes

- missing dependencies ([#5322](https://github.com/ExodusMovement/exodus-hydra/issues/5322)) ([01efedc](https://github.com/ExodusMovement/exodus-hydra/commit/01efedc7508fb14925277fdcd388afb721ac3dd1))

## [10.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@10.1.0...@exodus/fiat-balances@10.2.0) (2023-12-28)

### Features

- **redux:** add `byAsset` selector ([#5202](https://github.com/ExodusMovement/exodus-hydra/issues/5202)) ([6044ea6](https://github.com/ExodusMovement/exodus-hydra/commit/6044ea6b6768037e63e695ac838eddfc45fe5c14))

## [10.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@10.0.0...@exodus/fiat-balances@10.1.0) (2023-12-14)

### Features

- remove storing oldBalances in balances atoms ([#5073](https://github.com/ExodusMovement/exodus-hydra/issues/5073)) ([414db86](https://github.com/ExodusMovement/exodus-hydra/commit/414db866a86aaf3242e68698596af187da6927c3))

## [10.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@9.1.2...@exodus/fiat-balances@10.0.0) (2023-12-12)

### ⚠ BREAKING CHANGES

- mv `trackNonDustAssetsNamesPlugin` to fiat-balances (#4988)
- pass max wallet account amount to redux module (#4968)

### Features

- **fiat-balances:** add by base asset source selector ([#4695](https://github.com/ExodusMovement/exodus-hydra/issues/4695)) ([47a10a0](https://github.com/ExodusMovement/exodus-hydra/commit/47a10a07c5d24e25e838d9c4f6a6063c7364886f))
- mv `trackNonDustAssetsNamesPlugin` to fiat-balances ([#4988](https://github.com/ExodusMovement/exodus-hydra/issues/4988)) ([270d109](https://github.com/ExodusMovement/exodus-hydra/commit/270d109b0198a5b705059b12a77dff726b3314cc))
- pass max wallet account amount to redux module ([#4968](https://github.com/ExodusMovement/exodus-hydra/issues/4968)) ([e6ab869](https://github.com/ExodusMovement/exodus-hydra/commit/e6ab8696da1ae56921ca4faef2b964096c005280))

### Bug Fixes

- cleanup subscriptions on stop ([#4814](https://github.com/ExodusMovement/exodus-hydra/issues/4814)) ([d053582](https://github.com/ExodusMovement/exodus-hydra/commit/d0535826c2023dd4d3273b367bbcc5cca6e4bb95))

## [9.1.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@9.1.1...@exodus/fiat-balances@9.1.2) (2023-10-20)

### Bug Fixes

- import from atoms index ([#4508](https://github.com/ExodusMovement/exodus-hydra/issues/4508)) ([923fb99](https://github.com/ExodusMovement/exodus-hydra/commit/923fb992328b63e45401c78176b5a6ef7b666eee))

## [9.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@9.1.0...@exodus/fiat-balances@9.1.1) (2023-10-18)

**Note:** Version bump only for package @exodus/fiat-balances

## [9.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@9.0.0...@exodus/fiat-balances@9.1.0) (2023-09-13)

### Features

- add more selectors for fiat-balances ([#4018](https://github.com/ExodusMovement/exodus-hydra/issues/4018)) ([f4ccc17](https://github.com/ExodusMovement/exodus-hydra/commit/f4ccc17b433ce3a43c47c06aa9aa076f874b589b))

## [9.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@8.0.0...@exodus/fiat-balances@9.0.0) (2023-08-31)

### ⚠ BREAKING CHANGES

- emit fiat balances from plugin (#3800)

### Features

- emit fiat balances from plugin ([#3800](https://github.com/ExodusMovement/exodus-hydra/issues/3800)) ([a65b208](https://github.com/ExodusMovement/exodus-hydra/commit/a65b208ddd7125a6a88e1cbc6c88f50322d39f2f))

### Bug Fixes

- clone data ([#3794](https://github.com/ExodusMovement/exodus-hydra/issues/3794)) ([1726b0d](https://github.com/ExodusMovement/exodus-hydra/commit/1726b0db2558953f17ad1eb2b35820c1f1dc809a))

## [8.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@7.1.0...@exodus/fiat-balances@8.0.0) (2023-08-25)

### ⚠ BREAKING CHANGES

- THIS PACKAGE NOT AFFECTED, only tests. remove store and actions from setup redux (#3575)

### Bug Fixes

- load balances once on start ([#3599](https://github.com/ExodusMovement/exodus-hydra/issues/3599)) ([55367ca](https://github.com/ExodusMovement/exodus-hydra/commit/55367caec36e8046358200b36fad3c21f7383ccb))

## [7.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@7.0.1...@exodus/fiat-balances@7.1.0) (2023-08-23)

### Features

- fiat balances redux ([#3519](https://github.com/ExodusMovement/exodus-hydra/issues/3519)) ([3aa42f3](https://github.com/ExodusMovement/exodus-hydra/commit/3aa42f3bbea0c8eef91cc7824d4585add2f6c5b9))

## [7.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@7.0.0...@exodus/fiat-balances@7.0.1) (2023-08-21)

### Bug Fixes

- fiat balances correct writesAtoms ([#3482](https://github.com/ExodusMovement/exodus-hydra/issues/3482)) ([41211a1](https://github.com/ExodusMovement/exodus-hydra/commit/41211a17f6493e9202d989d9efb2506d1b7e0aad))

## [7.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@6.3.2...@exodus/fiat-balances@7.0.0) (2023-08-21)

### ⚠ BREAKING CHANGES

- balances.load (#3383)

### Features

- balances.load ([#3383](https://github.com/ExodusMovement/exodus-hydra/issues/3383)) ([754179f](https://github.com/ExodusMovement/exodus-hydra/commit/754179f65713afc19490240702aa0fee18047073))

## [6.3.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@6.3.0...@exodus/fiat-balances@6.3.2) (2023-08-08)

### Performance Improvements

- don't flush if changes in fiat values are the same ([#3183](https://github.com/ExodusMovement/exodus-hydra/issues/3183)) ([a65383e](https://github.com/ExodusMovement/exodus-hydra/commit/a65383e0663584b9df1eba94ca429865506f2d63))

## [6.3.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@6.3.0...@exodus/fiat-balances@6.3.1) (2023-07-21)

**Note:** Version bump only for package @exodus/fiat-balances

## [6.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@6.2.2...@exodus/fiat-balances@6.3.0) (2023-07-10)

### Features

- export `fiatBalances` factory ([#2314](https://github.com/ExodusMovement/exodus-hydra/issues/2314)) ([da0dd61](https://github.com/ExodusMovement/exodus-hydra/commit/da0dd616d09188924d348f11437853bbfb438b54))

## [6.2.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@6.2.1...@exodus/fiat-balances@6.2.2) (2023-06-21)

### Performance Improvements

- dont set same value on observable again ([#2007](https://github.com/ExodusMovement/exodus-hydra/issues/2007)) ([3582c76](https://github.com/ExodusMovement/exodus-hydra/commit/3582c76fcfaebfc447c5ceb4d8be73ab28286047))

## [6.2.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@6.2.0...@exodus/fiat-balances@6.2.1) (2023-05-24)

### Bug Fixes

- fiat-balances test ([#1665](https://github.com/ExodusMovement/exodus-hydra/issues/1665)) ([b16a8ec](https://github.com/ExodusMovement/exodus-hydra/commit/b16a8ec2b06049fd59f177fbfb65145bf384f579))

## [6.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@6.1.0...@exodus/fiat-balances@6.2.0) (2023-05-12)

### Features

- remove enabledAssetsAtom from fiat-balances ([#1617](https://github.com/ExodusMovement/exodus-hydra/issues/1617)) ([ce93ef0](https://github.com/ExodusMovement/exodus-hydra/commit/ce93ef05aa5a3b754923c31e3b045813440778e9))

### Bug Fixes

- fiat balances test ([#1452](https://github.com/ExodusMovement/exodus-hydra/issues/1452)) ([eecd1f9](https://github.com/ExodusMovement/exodus-hydra/commit/eecd1f9fdf182538eb8bcd8b5590a4ed1cc9dd65))

## [6.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@6.0.0...@exodus/fiat-balances@6.1.0) (2023-05-01)

### Features

- add optimisticFiatBalancesAtom definition ([#1448](https://github.com/ExodusMovement/exodus-hydra/issues/1448)) ([10f936e](https://github.com/ExodusMovement/exodus-hydra/commit/10f936e1e35cc88f3481691a5187a309f120201f))

## [6.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@5.0.0...@exodus/fiat-balances@6.0.0) (2023-04-28)

### ⚠ BREAKING CHANGES

- fiat-balances load method (#1383)

### Features

- fiat-balances load method ([#1383](https://github.com/ExodusMovement/exodus-hydra/issues/1383)) ([1adf3b7](https://github.com/ExodusMovement/exodus-hydra/commit/1adf3b78cc7865fa6a8da7eb87bdd7d1795a45ef))

## [5.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@4.0.0...@exodus/fiat-balances@5.0.0) (2023-04-25)

### ⚠ BREAKING CHANGES

- use atoms in fiat balances (#1355)
- replace emit with atom in balances module (#1349)

### Features

- replace emit with atom in balances module ([#1349](https://github.com/ExodusMovement/exodus-hydra/issues/1349)) ([f9110f8](https://github.com/ExodusMovement/exodus-hydra/commit/f9110f8e9e76b8b199bc4d40461cb1bed3a5be1e))
- use atoms in fiat balances ([#1355](https://github.com/ExodusMovement/exodus-hydra/issues/1355)) ([3bbdb4d](https://github.com/ExodusMovement/exodus-hydra/commit/3bbdb4d0a956151d9e4895d2445cf8deee19dd09))

## [4.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@3.0.0...@exodus/fiat-balances@4.0.0) (2023-02-02)

### ⚠ BREAKING CHANGES

- fiat-balances exports & auto-bind config (#837)
- accept enabled wallet accounts atom (#544)

### Features

- add `restricted-imports` eslint rule ([#719](https://github.com/ExodusMovement/exodus-hydra/issues/719)) ([175de9c](https://github.com/ExodusMovement/exodus-hydra/commit/175de9c19ec00e5a12441022c313837d58f38882))
- restrict module-side-effects lint rule to only observe ([#782](https://github.com/ExodusMovement/exodus-hydra/issues/782)) ([58ac1b2](https://github.com/ExodusMovement/exodus-hydra/commit/58ac1b2c70a91f1480b16d0c38bdf89a568b0f95))

### Code Refactoring

- accept enabled wallet accounts atom ([#544](https://github.com/ExodusMovement/exodus-hydra/issues/544)) ([bdeaf02](https://github.com/ExodusMovement/exodus-hydra/commit/bdeaf029b6080bbb42d575545e9b711faa21b6c8))
- fiat-balances exports & auto-bind config ([#837](https://github.com/ExodusMovement/exodus-hydra/issues/837)) ([7c322f5](https://github.com/ExodusMovement/exodus-hydra/commit/7c322f516e5316e64c7e469bf67aba529e4cc001))

## [3.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@2.0.1...@exodus/fiat-balances@3.0.0) (2022-10-18)

### Bug Fixes

- **fiat-balances:** don't crash when walletAccounts are added/removed ([#329](https://github.com/ExodusMovement/exodus-hydra/issues/329)) ([84a68d5](https://github.com/ExodusMovement/exodus-hydra/commit/84a68d5b7ef40741029b0e61fced98b453dcff1e))
- not all balance fields may change in a balances event, add safety check in fiat-balances ([#328](https://github.com/ExodusMovement/exodus-hydra/issues/328)) ([23f7ce1](https://github.com/ExodusMovement/exodus-hydra/commit/23f7ce10fe1dd15b103454cee3b4b374052713ff))

## [2.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@2.0.0...@exodus/fiat-balances@2.0.1) (2022-10-13)

**Note:** Version bump only for package @exodus/fiat-balances

## [2.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@1.0.6...@exodus/fiat-balances@2.0.0) (2022-10-03)

### ⚠ BREAKING CHANGES

- rm asset.available usage in enabled-assets in favor of availableAssetNamesAtom (#236)

### Bug Fixes

- fiat balances test ([#251](https://github.com/ExodusMovement/exodus-hydra/issues/251)) ([69f75ba](https://github.com/ExodusMovement/exodus-hydra/commit/69f75ba4cae650f6b678cc2478db2a61e3dc1444))

### Code Refactoring

- rm asset.available usage in enabled-assets in favor of availableAssetNamesAtom ([#236](https://github.com/ExodusMovement/exodus-hydra/issues/236)) ([375e955](https://github.com/ExodusMovement/exodus-hydra/commit/375e955eef691e84d36fdc72d4d5b5a080b4035e))

## [1.0.6](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@1.0.5...@exodus/fiat-balances@1.0.6) (2022-09-26)

Refactor(balances): provide all potentially relevant txLogs to getBalancesFromBlockchainMetadata
https://github.com/ExodusMovement/exodus-hydra/pull/223

## [1.0.5](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@1.0.4...@exodus/fiat-balances@1.0.5) (2022-09-07)

### Bug Fixes

- safe access to nested field ([#232](https://github.com/ExodusMovement/exodus-hydra/issues/232)) ([56e9269](https://github.com/ExodusMovement/exodus-hydra/commit/56e92694d1622653aed3efb7604de0bf2e367388))

## [1.0.4](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@1.0.3...@exodus/fiat-balances@1.0.4) (2022-09-06)

### Bug Fixes

- parentheses in wrong place ([#230](https://github.com/ExodusMovement/exodus-hydra/issues/230)) ([4c2aa9a](https://github.com/ExodusMovement/exodus-hydra/commit/4c2aa9a9b43cfcf7b48c5098b2dbbdbae5741c4d))

## [1.0.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@1.0.2...@exodus/fiat-balances@1.0.3) (2022-09-06)

### Bug Fixes

- **fiat-balances:** undesired balance reset ([#219](https://github.com/ExodusMovement/exodus-hydra/issues/219)) ([642b64e](https://github.com/ExodusMovement/exodus-hydra/commit/642b64e2e8ede129896834f5aef527563e9694a0))

## [1.0.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@1.0.1...@exodus/fiat-balances@1.0.2) (2022-08-10)

**Note:** Version bump only for package @exodus/fiat-balances

## [1.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/fiat-balances@1.0.0...@exodus/fiat-balances@1.0.1) (2022-08-10)

**Note:** Version bump only for package @exodus/fiat-balances
