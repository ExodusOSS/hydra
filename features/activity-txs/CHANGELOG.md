# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [6.1.9](https://github.com/ExodusMovement/exodus/compare/@exodus/activity-txs@6.1.8...@exodus/activity-txs@6.1.9) (2026-09-02)

### Bug Fixes

- **activity-txs:** tolerate null tx source in limited and by-id selectors ([#44450](https://github.com/ExodusMovement/exodus/issues/44450)) ([6e371b1](https://github.com/ExodusMovement/exodus/commit/6e371b1394b456decd58e9ded1125f0f8fa1a816))

## [6.1.8](https://github.com/ExodusMovement/exodus/compare/@exodus/activity-txs@6.1.7...@exodus/activity-txs@6.1.8) (2026-08-27)

### Bug Fixes

- **activity-txs:** return empty activity when tx source selector returns null ([#44246](https://github.com/ExodusMovement/exodus/issues/44246)) ([3d62429](https://github.com/ExodusMovement/exodus/commit/3d62429dea3711c7bde0893db9d4d3975ce6eeaa))

## [6.1.7](https://github.com/ExodusMovement/exodus/compare/@exodus/activity-txs@6.1.6...@exodus/activity-txs@6.1.7) (2026-08-03)

### Bug Fixes

- **activity-txs:** type grouped swap rows as exchange via their swap leg ([#42988](https://github.com/ExodusMovement/exodus/issues/42988)) ([f8309b8](https://github.com/ExodusMovement/exodus/commit/f8309b8f071b2884093a110e7a1c8823d43ac60c))

## [6.1.6](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@6.1.5...@exodus/activity-txs@6.1.6) (2026-06-27)

### Bug Fixes

- **activity-txs:** handle iterable (TxSet) tx source in groupTxsWithSameOrder ([#17380](https://github.com/ExodusMovement/exodus-hydra/issues/17380)) ([9ad4b9f](https://github.com/ExodusMovement/exodus-hydra/commit/9ad4b9f3ffc9f01708498ebf1286c932b0b7a999))

## [6.1.5](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@6.1.4...@exodus/activity-txs@6.1.5) (2026-06-25)

### Bug Fixes

- **activity-txs:** suppress orphaned chained-swap bridge leg ([#17354](https://github.com/ExodusMovement/exodus-hydra/issues/17354)) ([328b41a](https://github.com/ExodusMovement/exodus-hydra/commit/328b41af15695bf4e4c3057360354fa7b7897d04))

## [6.1.4](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@6.1.3...@exodus/activity-txs@6.1.4) (2026-06-24)

### Bug Fixes

- **activity-txs:** collapse chained swap bridge legs into one row ([#17326](https://github.com/ExodusMovement/exodus-hydra/issues/17326)) ([befd253](https://github.com/ExodusMovement/exodus-hydra/commit/befd253a6853bcc15ddf64ba8212adde1ad53c33))

## [6.1.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@6.1.2...@exodus/activity-txs@6.1.3) (2026-05-13)

**Note:** Version bump only for package @exodus/activity-txs

## [6.1.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@6.1.1...@exodus/activity-txs@6.1.2) (2026-05-08)

### Bug Fixes

- fix(activity-txs): fiat order duplicates (#16369)

## [6.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@6.1.0...@exodus/activity-txs@6.1.1) (2026-03-24)

### Bug Fixes

- fix(activity-txs): avoid crashes for incomplete unindexed swap orders (#15662)

## [6.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@6.0.0...@exodus/activity-txs@6.1.0) (2026-02-05)

### Features

- feat: improve activity calculation (#15119)

## [6.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@5.0.2...@exodus/activity-txs@6.0.0) (2026-01-26)

### ⚠ BREAKING CHANGES

- **orders:** use typescript (#14786)

### Features

- feat: update all consumers to use safe strings for error namespaces (#14429)

### Bug Fixes

- fix(activity-txs): fiat order duplicates wallet order (#14959)

- fix: update NFT transaction sent status calculation (#14359)

- refactor(orders)!: use typescript (#14786)

## [5.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@5.0.2...@exodus/activity-txs@5.1.0) (2025-11-19)

### Features

- feat: update all consumers to use safe strings for error namespaces (#14429)

### Bug Fixes

- fix: update NFT transaction sent status calculation (#14359)

## [5.0.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@5.0.1...@exodus/activity-txs@5.0.2) (2025-11-05)

### Bug Fixes

- fix(activity-txs): missing batched same tx id fiat orders (#14323)

## [5.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@5.0.0...@exodus/activity-txs@5.0.1) (2025-10-01)

### Bug Fixes

- fix: prevent base asset transactions from showing as swap activity (#13967)

## [5.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@4.8.0...@exodus/activity-txs@5.0.0) (2025-05-29)

### ⚠ BREAKING CHANGES

- rename argument for pending fiat orders (#12718)

### Features

- feat!: rename argument for pending fiat orders (#12718)

## [4.8.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@4.7.2...@exodus/activity-txs@4.8.0) (2025-05-22)

### Features

- feat: add fiat orders without tx (#12625)

## [4.7.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@4.7.1...@exodus/activity-txs@4.7.2) (2025-05-21)

### Bug Fixes

- fix: Cross-Portfolio Swap Transactions Appear in All Portfolios (#12623)

## [4.7.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@4.7.0...@exodus/activity-txs@4.7.1) (2025-05-20)

### Bug Fixes

- fix: activity with nft item without tx (#12591)

## [4.7.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@4.6.5...@exodus/activity-txs@4.7.0) (2025-05-14)

### Features

- feat: make activity-txs to proper ESM (#12451)

## [4.6.5](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@4.6.4...@exodus/activity-txs@4.6.5) (2025-04-03)

### Bug Fixes

- fix: filter out tx activities associated with a spam nft (#11950)

## [4.6.4](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@4.6.3...@exodus/activity-txs@4.6.4) (2025-02-12)

### Performance

- perf: memoize createInitialPerAssetData per asset (#11417)

## [4.6.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@4.6.2...@exodus/activity-txs@4.6.3) (2025-02-03)

### Bug Fixes

- fix(activity-txs): safe order access (#11334)

## [4.6.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@4.6.1...@exodus/activity-txs@4.6.2) (2025-01-31)

### Bug Fixes

- fix: invalidate order by amount for rbf tx (#11303)

## [4.6.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@4.6.0...@exodus/activity-txs@4.6.1) (2025-01-31)

### Bug Fixes

- fix: nft activity item pending field (#11240)

## [4.6.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@4.5.0...@exodus/activity-txs@4.6.0) (2025-01-28)

### Features

- feat: add placeholder types files (#11228)

### Bug Fixes

- fix: isolate getActivityTxs api call error (#11264)

## [4.5.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@4.4.3...@exodus/activity-txs@4.5.0) (2025-01-15)

### Features

- feat: add account to activity (#11090)

## [4.4.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@4.4.1...@exodus/activity-txs@4.4.3) (2025-01-05)

### Bug Fixes

- fix: activity id generation (#10846)

- fix: assume asset.api.getActivity is async (#10848)

### License

- license: re-license under MIT license (#10580)

## [4.4.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@4.4.1...@exodus/activity-txs@4.4.2) (2024-11-25)

### License

- license: re-license under MIT license (#10580)

## [4.4.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@4.4.0...@exodus/activity-txs@4.4.1) (2024-10-04)

### Bug Fixes

- typo in activity selector ([#9777](https://github.com/ExodusMovement/exodus-hydra/issues/9777)) ([0a33139](https://github.com/ExodusMovement/exodus-hydra/commit/0a331397ecac23f1240af6cc509b22099282ce4a))

## [4.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@4.3.5...@exodus/activity-txs@4.4.0) (2024-10-04)

### Features

- support pending orders ([#9742](https://github.com/ExodusMovement/exodus-hydra/issues/9742)) ([3e78668](https://github.com/ExodusMovement/exodus-hydra/commit/3e786689bb3522432e389ca737d46f132953f34c))
- use atoms v9 ([#9651](https://github.com/ExodusMovement/exodus-hydra/issues/9651)) ([524aa61](https://github.com/ExodusMovement/exodus-hydra/commit/524aa61f69c81e6ac00b2f94ea830688a105b3e4))

## [4.3.5](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@4.3.4...@exodus/activity-txs@4.3.5) (2024-09-25)

### Bug Fixes

- activity txs orders dependency should be optional ([#9430](https://github.com/ExodusMovement/exodus-hydra/issues/9430)) ([706c081](https://github.com/ExodusMovement/exodus-hydra/commit/706c0819fa47b4683b3b0a5e7d4ce29ff0d7f9a9))

## [4.3.4](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@4.3.3...@exodus/activity-txs@4.3.4) (2024-09-16)

### Bug Fixes

- **activity-txs:** make id to return orderId ([#9215](https://github.com/ExodusMovement/exodus-hydra/issues/9215)) ([a2f77b4](https://github.com/ExodusMovement/exodus-hydra/commit/a2f77b4e06c7302d3fda66a72d9a2b72025820c1))

## [4.3.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@4.3.2...@exodus/activity-txs@4.3.3) (2024-09-09)

**Note:** Version bump only for package @exodus/activity-txs

## [4.3.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@4.3.1...@exodus/activity-txs@4.3.2) (2024-07-25)

### Bug Fixes

- migrate definitions ([#8030](https://github.com/ExodusMovement/exodus-hydra/issues/8030)) ([d2dfde5](https://github.com/ExodusMovement/exodus-hydra/commit/d2dfde55dfa843eb52842f64b3aac3a6f9a59069))

## [4.3.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@4.3.0...@exodus/activity-txs@4.3.1) (2024-07-18)

**Note:** Version bump only for package @exodus/activity-txs

## [4.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@4.2.2...@exodus/activity-txs@4.3.0) (2024-06-13)

### Features

- optional personal notes for activity ([#7377](https://github.com/ExodusMovement/exodus-hydra/issues/7377)) ([092f07d](https://github.com/ExodusMovement/exodus-hydra/commit/092f07d5d18c1afc2933672af77edd0c5bac98a5))

## [4.2.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@4.2.1...@exodus/activity-txs@4.2.2) (2024-06-11)

### Bug Fixes

- activity should support limit prop ([#7330](https://github.com/ExodusMovement/exodus-hydra/issues/7330)) ([687c7d5](https://github.com/ExodusMovement/exodus-hydra/commit/687c7d550d5aaef94f6e29b374944be361197622))

## [4.2.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@4.2.0...@exodus/activity-txs@4.2.1) (2024-05-30)

### Bug Fixes

- memoize activity selectors ([#7223](https://github.com/ExodusMovement/exodus-hydra/issues/7223)) ([cf4cb47](https://github.com/ExodusMovement/exodus-hydra/commit/cf4cb478355548d355180c81ad15b0558d0d7ad6))

## [4.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@4.1.5...@exodus/activity-txs@4.2.0) (2024-05-29)

### Features

- order in activity ([#7220](https://github.com/ExodusMovement/exodus-hydra/issues/7220)) ([b32e3e0](https://github.com/ExodusMovement/exodus-hydra/commit/b32e3e0dd8d16e937c91017665f85c7ff1291120))

## [4.1.5](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@4.1.4...@exodus/activity-txs@4.1.5) (2024-05-29)

### Bug Fixes

- swap activity assetName should match transaction asset ([#7180](https://github.com/ExodusMovement/exodus-hydra/issues/7180)) ([521aa0c](https://github.com/ExodusMovement/exodus-hydra/commit/521aa0ce7cb0c6e39f7cd8fb6c684b4fd2eeffa1))

## [4.1.4](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@4.1.3...@exodus/activity-txs@4.1.4) (2024-05-27)

### Bug Fixes

- type check in activity selector ([#7146](https://github.com/ExodusMovement/exodus-hydra/issues/7146)) ([37298c3](https://github.com/ExodusMovement/exodus-hydra/commit/37298c3cca33251085f6c62a0b378ead8350f755))

## [4.1.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@4.1.2...@exodus/activity-txs@4.1.3) (2024-05-27)

**Note:** Version bump only for package @exodus/activity-txs

## [4.1.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@4.1.1...@exodus/activity-txs@4.1.2) (2024-05-15)

### Bug Fixes

- address security feedback ([#6963](https://github.com/ExodusMovement/exodus-hydra/issues/6963)) ([155bdfe](https://github.com/ExodusMovement/exodus-hydra/commit/155bdfed531685108d828be60c9d1a8be9e785ee))
- indexless order should be ignored in first loop ([#6965](https://github.com/ExodusMovement/exodus-hydra/issues/6965)) ([83766cd](https://github.com/ExodusMovement/exodus-hydra/commit/83766cd69533d81317ea52ab770541a7ccfde274))

## [4.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@4.1.0...@exodus/activity-txs@4.1.1) (2024-05-15)

### Bug Fixes

- duplicated activity items for transfers ([#6931](https://github.com/ExodusMovement/exodus-hydra/issues/6931)) ([7d2acb6](https://github.com/ExodusMovement/exodus-hydra/commit/7d2acb63b3151b9703243349e256b1db52613b43))

## [4.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@4.0.1...@exodus/activity-txs@4.1.0) (2024-05-13)

### Features

- activity base selector ([#6712](https://github.com/ExodusMovement/exodus-hydra/issues/6712)) ([929a87c](https://github.com/ExodusMovement/exodus-hydra/commit/929a87ce359195aafb177248eed3f0c4fe544452))
- add withFiat selector ([#6766](https://github.com/ExodusMovement/exodus-hydra/issues/6766)) ([10c9aaf](https://github.com/ExodusMovement/exodus-hydra/commit/10c9aaf8e28c2ad13885e4f1c5d8ff6f345d6508))
- connections activity selector ([#6855](https://github.com/ExodusMovement/exodus-hydra/issues/6855)) ([37bc022](https://github.com/ExodusMovement/exodus-hydra/commit/37bc0221be3a6c536b0fbf5f6ee22b06e084667d))
- full activity selector ([#6861](https://github.com/ExodusMovement/exodus-hydra/issues/6861)) ([7d0d168](https://github.com/ExodusMovement/exodus-hydra/commit/7d0d1689c37e14169a24fd73670183c282f0ad41))
- multi activity ([#6870](https://github.com/ExodusMovement/exodus-hydra/issues/6870)) ([7d72596](https://github.com/ExodusMovement/exodus-hydra/commit/7d72596b9718511f5e3ca43f4b36a5890a7b6b76))
- withNfts selectors ([#6765](https://github.com/ExodusMovement/exodus-hydra/issues/6765)) ([1f6d3d6](https://github.com/ExodusMovement/exodus-hydra/commit/1f6d3d668c32b184ca26cdbbb47c418c007ea7a1))

### Bug Fixes

- missing dependencies ([#5322](https://github.com/ExodusMovement/exodus-hydra/issues/5322)) ([01efedc](https://github.com/ExodusMovement/exodus-hydra/commit/01efedc7508fb14925277fdcd388afb721ac3dd1))

## [4.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@4.0.0...@exodus/activity-txs@4.0.1) (2023-12-20)

### Bug Fixes

- empty activity txs for indexless assets ([#5144](https://github.com/ExodusMovement/exodus-hydra/issues/5144)) ([6c4eca7](https://github.com/ExodusMovement/exodus-hydra/commit/6c4eca7c14103242accb52dc746706d875feefb3))

## [4.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@3.2.1...@exodus/activity-txs@4.0.0) (2023-12-18)

### ⚠ BREAKING CHANGES

- pre-calc activity options (#5121)

### Features

- pre-calc activity options ([#5121](https://github.com/ExodusMovement/exodus-hydra/issues/5121)) ([cc3a906](https://github.com/ExodusMovement/exodus-hydra/commit/cc3a906e77b1f1c05d297efcb9aa0ba7eae6d5ca))

## [3.2.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@3.2.0...@exodus/activity-txs@3.2.1) (2023-12-18)

### Bug Fixes

- memoize txs argument ([#5120](https://github.com/ExodusMovement/exodus-hydra/issues/5120)) ([a3ea4ea](https://github.com/ExodusMovement/exodus-hydra/commit/a3ea4eaf92bda5a6e7506c56e3d534b38fcbd215))

## [3.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@3.1.3...@exodus/activity-txs@3.2.0) (2023-12-13)

### Bug Fixes

- provide limit option to selector ([#5037](https://github.com/ExodusMovement/exodus-hydra/issues/5037)) ([e9676f1](https://github.com/ExodusMovement/exodus-hydra/commit/e9676f149b5e16caa46316d6985ea363ad531821))

## [3.1.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@3.1.2...@exodus/activity-txs@3.1.3) (2023-10-31)

### Bug Fixes

- collapse batch ([#4647](https://github.com/ExodusMovement/exodus-hydra/issues/4647)) ([d4e468f](https://github.com/ExodusMovement/exodus-hydra/commit/d4e468f80049e94aabe2bed79b8a4c8dee03db2b))

## [3.1.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@3.1.1...@exodus/activity-txs@3.1.2) (2023-10-20)

### Bug Fixes

- import from atoms index ([#4508](https://github.com/ExodusMovement/exodus-hydra/issues/4508)) ([923fb99](https://github.com/ExodusMovement/exodus-hydra/commit/923fb992328b63e45401c78176b5a6ef7b666eee))

## [3.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@3.1.0...@exodus/activity-txs@3.1.1) (2023-10-18)

### Bug Fixes

- remaining hasOwnProperty call ([#4472](https://github.com/ExodusMovement/exodus-hydra/issues/4472)) ([f8cdf1f](https://github.com/ExodusMovement/exodus-hydra/commit/f8cdf1f0fd6308749f15b4290edb5dd4763a785a))

## [3.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@3.0.0...@exodus/activity-txs@3.1.0) (2023-10-18)

### Features

- call hasOwnProperty on prototype for security ([#4461](https://github.com/ExodusMovement/exodus-hydra/issues/4461)) ([f257407](https://github.com/ExodusMovement/exodus-hydra/commit/f2574075dbf2855301b9fc14d7fc7eaeb35f2455))

## [3.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@2.0.0...@exodus/activity-txs@3.0.0) (2023-10-06)

### ⚠ BREAKING CHANGES

- return array from activity txs (#4370)

### Bug Fixes

- return array from activity txs ([#4370](https://github.com/ExodusMovement/exodus-hydra/issues/4370)) ([ba00cff](https://github.com/ExodusMovement/exodus-hydra/commit/ba00cfffa72a4264e311a13d609ec865174a54c0))

## [2.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@1.1.0...@exodus/activity-txs@2.0.0) (2023-09-28)

### ⚠ BREAKING CHANGES

- store txSet model in activity atom (#4265)

### Features

- store txSet model in activity atom ([#4265](https://github.com/ExodusMovement/exodus-hydra/issues/4265)) ([7bcf4b3](https://github.com/ExodusMovement/exodus-hydra/commit/7bcf4b350f5579301dc8d9e92a8058a35b85c759))

## [1.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/activity-txs@1.0.0...@exodus/activity-txs@1.1.0) (2023-09-28)

### Features

- filter out assets with noHistory ([#4263](https://github.com/ExodusMovement/exodus-hydra/issues/4263)) ([839ee94](https://github.com/ExodusMovement/exodus-hydra/commit/839ee94f918de9e02ac64d8626016ef781545df1))
