# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.14.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@4.14.2...@exodus/rates-monitor@4.14.3) (2025-06-09)

### Bug Fixes

- fix: don't use npm: aliases for lodash (#12861)

## [4.14.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@4.14.0...@exodus/rates-monitor@4.14.2) (2025-05-15)

### Bug Fixes

- fix: abort rates-monitor when not started (#12467)

- fix: disable simulation at the source in rates-monitor plugin (#12277)

- fix: don't call setInterval from stopped rates-monitor (#12457)

## [4.14.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@4.14.0...@exodus/rates-monitor@4.14.1) (2025-05-09)

### Bug Fixes

- fix: disable simulation at the source in rates-monitor plugin (#12277)

## [4.14.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@4.13.0...@exodus/rates-monitor@4.14.0) (2025-05-08)

### Features

- feat: make rates-monitor proper ESM (#12255)

## [4.13.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@4.12.2...@exodus/rates-monitor@4.13.0) (2025-04-28)

### Features

- feat(rates-monitor): add onClear hook & move wallet-deletion cleanup from exodus-mobile (#12080)

## [4.12.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@4.12.1...@exodus/rates-monitor@4.12.2) (2025-04-16)

### Bug Fixes

- fix: duplicate \_update calls on simulation initialization and improve simulation state handling (#12023)

## [4.12.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@4.12.0...@exodus/rates-monitor@4.12.1) (2025-04-15)

### Bug Fixes

- fix: set minimum price threshold in simulation to prevent cache invalidation issues on mobile (#12015)

## [4.12.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@4.11.1...@exodus/rates-monitor@4.12.0) (2025-04-11)

### Features

- feat: add real-time price simulation for top assets (#11734)

## [4.11.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@4.11.0...@exodus/rates-monitor@4.11.1) (2025-04-04)

### Bug Fixes

- fix: lodash and events imports (#11954)

## [4.11.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@4.10.0...@exodus/rates-monitor@4.11.0) (2025-04-01)

### Features

- feat: stop exporting report definitions (#11900)

## [4.10.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@4.9.1...@exodus/rates-monitor@4.10.0) (2025-03-18)

### Features

- feat: add real time rate flag (#11810)

## [4.9.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@4.9.0...@exodus/rates-monitor@4.9.1) (2025-03-04)

### Bug Fixes

- fix: increase real-time pricing polling interval to 25s (#11649)

## [4.9.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@4.8.4...@exodus/rates-monitor@4.9.0) (2025-02-24)

### Features

- feat(rates-monitor): use optional chaining to access price data (#11584)

## [4.8.4](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@4.8.3...@exodus/rates-monitor@4.8.4) (2025-02-21)

### Bug Fixes

- fix: skip exporting most reports if wallet doesn't exist (#11553)

## [4.8.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@4.8.2...@exodus/rates-monitor@4.8.3) (2025-02-20)

**Note:** Version bump only for package @exodus/rates-monitor

## [4.8.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@4.8.1...@exodus/rates-monitor@4.8.2) (2025-02-14)

### Bug Fixes

- fix(rates-monitor): use Object.keys to check non-empty obj (#11464)

## [4.8.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@4.8.0...@exodus/rates-monitor@4.8.1) (2025-02-14)

### Bug Fixes

- fix: rates availableAssetNames observe improve (#11424)

- fix(rates-monitor): set valid default value for storage ratesAtom (#11444)

## [4.8.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@4.7.3...@exodus/rates-monitor@4.8.0) (2025-02-12)

### Features

- feat(rates-monitor): persistent ratesAtom (#11407)

## [4.7.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@4.7.2...@exodus/rates-monitor@4.7.3) (2025-02-04)

### Bug Fixes

- fix: initialize finalObj in the RatesMonitor class to prevent prototype inheritance (#11340)

## [4.7.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@4.7.1...@exodus/rates-monitor@4.7.2) (2025-02-02)

### Bug Fixes

- fix: when rates are not loaded for ticker add fallback. fix getIsRateAvailable selector to check price field defined (#11323)

## [4.7.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@4.7.0...@exodus/rates-monitor@4.7.1) (2025-01-29)

### Bug Fixes

- fix: real time prices (#11271)

## [4.7.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@4.6.0...@exodus/rates-monitor@4.7.0) (2025-01-14)

### Features

- feat(rates-monitor): implement real-time pricing fallback logic (#10940)

## [4.6.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@4.5.0...@exodus/rates-monitor@4.6.0) (2025-01-09)

### Features

- feat(pricing): currentPriceWithModifyCheck to allow short-circuit if resource not changed (#10950)

## [4.5.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@4.4.1...@exodus/rates-monitor@4.5.0) (2024-12-06)

### Features

- feat: use atoms v9 (#9651)

### License

- license: re-license under MIT license (#10355)

## [4.4.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@4.4.0...@exodus/rates-monitor@4.4.1) (2024-09-09)

**Note:** Version bump only for package @exodus/rates-monitor

## [4.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@4.3.3...@exodus/rates-monitor@4.4.0) (2024-08-19)

### Features

- **rates-monitor:** pass configs ([#8485](https://github.com/ExodusMovement/exodus-hydra/issues/8485)) ([1d32d63](https://github.com/ExodusMovement/exodus-hydra/commit/1d32d631b95bae5be19a27157d2c4abccee6fc86))

## [4.3.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@4.3.2...@exodus/rates-monitor@4.3.3) (2024-07-25)

### Bug Fixes

- migrate definitions ([#8030](https://github.com/ExodusMovement/exodus-hydra/issues/8030)) ([d2dfde5](https://github.com/ExodusMovement/exodus-hydra/commit/d2dfde55dfa843eb52842f64b3aac3a6f9a59069))

## [4.3.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@4.3.1...@exodus/rates-monitor@4.3.2) (2024-07-18)

**Note:** Version bump only for package @exodus/rates-monitor

## [4.3.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@4.3.0...@exodus/rates-monitor@4.3.1) (2024-06-18)

### Bug Fixes

- **types:** update import and incorrect index signature ([#7427](https://github.com/ExodusMovement/exodus-hydra/issues/7427)) ([1560260](https://github.com/ExodusMovement/exodus-hydra/commit/1560260ac3a4ae5a59bbb805e99751baf1c150d7))

## [4.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@4.2.0...@exodus/rates-monitor@4.3.0) (2024-06-17)

### Features

- add type declarations for redux definitions ([#7401](https://github.com/ExodusMovement/exodus-hydra/issues/7401)) ([4c5be2d](https://github.com/ExodusMovement/exodus-hydra/commit/4c5be2d46312e844d86fbb5600491fffbede86ce))

## [4.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@4.1.1...@exodus/rates-monitor@4.2.0) (2024-04-23)

### Features

- type remaining API methods shipped with headless ([#6619](https://github.com/ExodusMovement/exodus-hydra/issues/6619)) ([d1ec08e](https://github.com/ExodusMovement/exodus-hydra/commit/d1ec08e695f0df2c9e63b01169c746ef872fe541))

## [4.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@4.1.0...@exodus/rates-monitor@4.1.1) (2023-12-22)

### Bug Fixes

- pack missing `debug` folder ([#5166](https://github.com/ExodusMovement/exodus-hydra/issues/5166)) ([e5df4d1](https://github.com/ExodusMovement/exodus-hydra/commit/e5df4d1f872dd318bdedb3a7dc559d7809060913))

## [4.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@4.0.2...@exodus/rates-monitor@4.1.0) (2023-12-19)

### Features

- prepare `eslint-plugin-hydra` for publishing ([#4671](https://github.com/ExodusMovement/exodus-hydra/issues/4671)) ([9a01c10](https://github.com/ExodusMovement/exodus-hydra/commit/9a01c10757f3f5d7add361f31cf798e5c207044d))
- **rates:** debug api ([#5136](https://github.com/ExodusMovement/exodus-hydra/issues/5136)) ([a35a264](https://github.com/ExodusMovement/exodus-hydra/commit/a35a2645191f6d597f7eea637a078b39a1714726))

### Bug Fixes

- cleanup subscriptions on stop ([#4814](https://github.com/ExodusMovement/exodus-hydra/issues/4814)) ([d053582](https://github.com/ExodusMovement/exodus-hydra/commit/d0535826c2023dd4d3273b367bbcc5cca6e4bb95))

## [4.0.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@4.0.1...@exodus/rates-monitor@4.0.2) (2023-10-20)

### Bug Fixes

- import from atoms index ([#4508](https://github.com/ExodusMovement/exodus-hydra/issues/4508)) ([923fb99](https://github.com/ExodusMovement/exodus-hydra/commit/923fb992328b63e45401c78176b5a6ef7b666eee))

## [4.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@4.0.0...@exodus/rates-monitor@4.0.1) (2023-08-25)

### Features

This change was not included in v4.0.0 by mistake

- emit from plugin ([#3593](https://github.com/ExodusMovement/exodus-hydra/issues/3593)) ([f5e1a5d](https://github.com/ExodusMovement/exodus-hydra/commit/f5e1a5d1d2b0f62b08f955af5452aceccb293699))

## [4.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@3.4.0...@exodus/rates-monitor@4.0.0) (2023-08-25)

### ⚠ BREAKING CHANGES

- remove store and actions from setup redux (#3575)

### Code Refactoring

- remove store and actions from setup redux ([#3575](https://github.com/ExodusMovement/exodus-hydra/issues/3575)) ([64fa4a6](https://github.com/ExodusMovement/exodus-hydra/commit/64fa4a6c2b69409a81ab140adbdf84646f1be73a))

## [3.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@3.3.1...@exodus/rates-monitor@3.4.0) (2023-08-23)

### Features

- use assets redux module for assets selectors ([#3558](https://github.com/ExodusMovement/exodus-hydra/issues/3558)) ([4723c81](https://github.com/ExodusMovement/exodus-hydra/commit/4723c81f16d5915748e61ab51570b42bc89764f7))

## [3.3.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@3.3.0...@exodus/rates-monitor@3.3.1) (2023-08-21)

**Note:** Version bump only for package @exodus/rates-monitor

## [3.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@3.2.1...@exodus/rates-monitor@3.3.0) (2023-08-21)

### Features

- more rates selectors ([#3430](https://github.com/ExodusMovement/exodus-hydra/issues/3430)) ([e51b6e1](https://github.com/ExodusMovement/exodus-hydra/commit/e51b6e1601126a680fc5a14c1fd86a6ddbe7750e))

## [3.2.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@3.2.0...@exodus/rates-monitor@3.2.1) (2023-08-17)

### Bug Fixes

- add redux folder ([#3425](https://github.com/ExodusMovement/exodus-hydra/issues/3425)) ([84a42a7](https://github.com/ExodusMovement/exodus-hydra/commit/84a42a78d364f463c0d3cdb434bad079c3b38fa3))

## [3.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@3.1.0...@exodus/rates-monitor@3.2.0) (2023-08-14)

### Features

- rates-redux ([#3342](https://github.com/ExodusMovement/exodus-hydra/issues/3342)) ([6069a78](https://github.com/ExodusMovement/exodus-hydra/commit/6069a78a28b7785c78dc47d0cabd436287c525ec))

## [3.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@3.0.0...@exodus/rates-monitor@3.1.0) (2023-08-04)

### Features

- add rates report ([#3158](https://github.com/ExodusMovement/exodus-hydra/issues/3158)) ([fb05c48](https://github.com/ExodusMovement/exodus-hydra/commit/fb05c481c739ab3a4af43176e982c3a4ac5448be))

## [3.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@2.0.1...@exodus/rates-monitor@3.0.0) (2023-07-21)

### ⚠ BREAKING CHANGES

- rates-monitor feature (#2829)

### Features

- rates-monitor feature ([#2829](https://github.com/ExodusMovement/exodus-hydra/issues/2829)) ([52c3bbf](https://github.com/ExodusMovement/exodus-hydra/commit/52c3bbf4eb01a7ca750735786b6a9699748798dc))

### Bug Fixes

- add missing types ([#2423](https://github.com/ExodusMovement/exodus-hydra/issues/2423)) ([b9cbf21](https://github.com/ExodusMovement/exodus-hydra/commit/b9cbf21005ff9ff12e9a5b72ff833c37d67e848e))

## [2.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@2.0.0...@exodus/rates-monitor@2.0.1) (2023-06-21)

### Performance Improvements

- dont set same value on observable again ([#2007](https://github.com/ExodusMovement/exodus-hydra/issues/2007)) ([3582c76](https://github.com/ExodusMovement/exodus-hydra/commit/3582c76fcfaebfc447c5ceb4d8be73ab28286047))

## [2.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@1.6.1...@exodus/rates-monitor@2.0.0) (2023-05-03)

### ⚠ BREAKING CHANGES

- rates-monitor to new exports shape, new config convention (#834)

### Features

- restrict module-side-effects lint rule to only observe ([#782](https://github.com/ExodusMovement/exodus-hydra/issues/782)) ([58ac1b2](https://github.com/ExodusMovement/exodus-hydra/commit/58ac1b2c70a91f1480b16d0c38bdf89a568b0f95))

### Code Refactoring

- rates-monitor to new exports shape, new config convention ([#834](https://github.com/ExodusMovement/exodus-hydra/issues/834)) ([0f08c05](https://github.com/ExodusMovement/exodus-hydra/commit/0f08c0583ac9ac364ded8f611131eff7b313c569))

## [1.6.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@1.6.0...@exodus/rates-monitor@1.6.1) (2023-01-24)

### Bug Fixes

- do sync if started on start ([#766](https://github.com/ExodusMovement/exodus-hydra/issues/766)) ([1f19664](https://github.com/ExodusMovement/exodus-hydra/commit/1f19664bb8839328e6bb6ec9c9e965f78d8ae86b))

## [1.6.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@1.5.0...@exodus/rates-monitor@1.6.0) (2023-01-18)

### Features

- automatically update rates for new assets ([#657](https://github.com/ExodusMovement/exodus-hydra/issues/657)) ([2e5d067](https://github.com/ExodusMovement/exodus-hydra/commit/2e5d0671c8929f98311b7119b6ada686410d4415))

## [1.5.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@1.4.0...@exodus/rates-monitor@1.5.0) (2023-01-05)

### Features

- use rates-atom data ([#646](https://github.com/ExodusMovement/exodus-hydra/issues/646)) ([0af15db](https://github.com/ExodusMovement/exodus-hydra/commit/0af15db0175c3987bc08dc315c82169af59e6a62))

## [1.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@1.3.1...@exodus/rates-monitor@1.4.0) (2022-12-26)

### Features

- enable rates monitor for potential custom tokens ([#608](https://github.com/ExodusMovement/exodus-hydra/issues/608)) ([09c7ac4](https://github.com/ExodusMovement/exodus-hydra/commit/09c7ac486c8c67e6ffb0739c9cb38a993d686b1d))

## [1.3.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@1.3.0...@exodus/rates-monitor@1.3.1) (2022-11-11)

### Performance Improvements

- skip update if one is ongoing ([#465](https://github.com/ExodusMovement/exodus-hydra/issues/465)) ([40cd7ee](https://github.com/ExodusMovement/exodus-hydra/commit/40cd7eead12d2481f99bbc2c0e0f6249a9f6bae3))

## [1.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@1.2.1...@exodus/rates-monitor@1.3.0) (2022-11-11)

### Features

- add method to update rates unscheduled ([#462](https://github.com/ExodusMovement/exodus-hydra/issues/462)) ([a4ffb2c](https://github.com/ExodusMovement/exodus-hydra/commit/a4ffb2c163e41723df959845799d29fc5c6eadcc))

## [1.2.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@1.2.0...@exodus/rates-monitor@1.2.1) (2022-11-10)

### Performance Improvements

- refactor some nits in rates monitor ([#444](https://github.com/ExodusMovement/exodus-hydra/issues/444)) ([98f1050](https://github.com/ExodusMovement/exodus-hydra/commit/98f1050ffbf584921b996d1a57a6870f34292636))

## [1.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/rates-monitor@1.1.0...@exodus/rates-monitor@1.2.0) (2022-11-10)

### Features

- log missing rates ([#448](https://github.com/ExodusMovement/exodus-hydra/issues/448)) ([92f569d](https://github.com/ExodusMovement/exodus-hydra/commit/92f569dddceae9814e11a13ffcb9d4c6bac078d1))

### Bug Fixes

- set invalid flag when prices missing ([#447](https://github.com/ExodusMovement/exodus-hydra/issues/447)) ([597883e](https://github.com/ExodusMovement/exodus-hydra/commit/597883ea2e0dd57907c5e19a80e4a88589bf7cc4))

## 1.1.0 (2022-11-08)

### Features

- display prices in user selected currency ([#86](https://github.com/ExodusMovement/exodus-hydra/issues/86)) ([f948711](https://github.com/ExodusMovement/exodus-hydra/commit/f9487110e48c5dc98ecaed3a7c2b12c84eaf11f3))

### Bug Fixes

- added ignoreInvalidSymbols to pricing server requests ([#539](https://github.com/ExodusMovement/exodus-hydra/issues/539)) ([8df58ae](https://github.com/ExodusMovement/exodus-hydra/commit/8df58ae6ccf49f371138349e5434bff955d858fd))
