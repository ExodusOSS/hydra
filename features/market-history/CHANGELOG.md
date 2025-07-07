# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [10.3.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@10.3.0...@exodus/market-history@10.3.1) (2025-07-01)

### Bug Fixes

- fix: market history loading (#13078)

## [10.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@10.2.4...@exodus/market-history@10.3.0) (2025-07-01)

### Features

- feat: merge price-api with market-history (#12962)

## [10.2.4](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@10.2.3...@exodus/market-history@10.2.4) (2025-06-17)

### Performance

- perf(market-history): Optimize price transformation logic (#12932)

## [10.2.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@10.2.2...@exodus/market-history@10.2.3) (2025-06-16)

### Performance

- perf: don't clone historicalPrices to handle current rate logic (#12931)

## [10.2.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@10.2.1...@exodus/market-history@10.2.2) (2025-05-26)

### Bug Fixes

- fix: potential race condition (#12678)

## [10.2.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@10.2.0...@exodus/market-history@10.2.1) (2025-05-18)

### Bug Fixes

- fix: market-history stop (#12548)

## [10.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@10.1.3...@exodus/market-history@10.2.0) (2025-05-08)

### Features

- feat: make market-history proper ESM (#12256)

## [10.1.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@10.1.2...@exodus/market-history@10.1.3) (2025-05-06)

### Bug Fixes

- fix: actually check for data in marketHistory loading selectors (#12146)

## [10.1.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@10.1.1...@exodus/market-history@10.1.2) (2025-04-25)

### Bug Fixes

- fix: round down fetch limit to avoid fractional values in API request (#12061)

## [10.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@10.1.0...@exodus/market-history@10.1.1) (2025-04-22)

### Bug Fixes

- fix: market history. mutliple calls on foreground, missing timers setup (#12036)

- fix: only set market history loaded=true when actual data exists (#12031)

- fix: prevent update all call until started (#12025)

## [10.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@10.0.1...@exodus/market-history@10.1.0) (2025-04-14)

### Features

- feat: add minute granularity support for market history charts (#11984)

## [10.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@10.0.0...@exodus/market-history@10.0.1) (2025-04-01)

### Bug Fixes

- fix: type for market history api (#11917)

## [10.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@9.2.1...@exodus/market-history@10.0.0) (2025-03-27)

### ⚠ BREAKING CHANGES

- combine historical prices atom calls (#11874)

### Features

- feat!: combine historical prices atom calls (#11874)

## [9.2.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@9.2.0...@exodus/market-history@9.2.1) (2025-03-25)

### Bug Fixes

- fix: don't fetch combined assets (#11868)

## [9.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@9.1.2...@exodus/market-history@9.2.0) (2025-01-24)

### Features

- feat(market-history): add ts types (#11216)

## [9.1.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@9.1.1...@exodus/market-history@9.1.2) (2024-12-06)

### License

- license: re-license under MIT license (#10355)

## [9.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@9.1.0...@exodus/market-history@9.1.1) (2024-11-13)

### Bug Fixes

- fix: dont return cache only if atom has value (#10393)

## [9.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@9.0.5...@exodus/market-history@9.1.0) (2024-10-07)

### Features

- **market-history:** don't set cache ([#9801](https://github.com/ExodusMovement/exodus-hydra/issues/9801)) ([dbc0563](https://github.com/ExodusMovement/exodus-hydra/commit/dbc056390b984167c0a2b9d730837e4ea5a603f3))
- use atoms v9 ([#9651](https://github.com/ExodusMovement/exodus-hydra/issues/9651)) ([524aa61](https://github.com/ExodusMovement/exodus-hydra/commit/524aa61f69c81e6ac00b2f94ea830688a105b3e4))

## [9.0.5](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@9.0.4...@exodus/market-history@9.0.5) (2024-09-09)

**Note:** Version bump only for package @exodus/market-history

## [9.0.4](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@9.0.3...@exodus/market-history@9.0.4) (2024-07-25)

### Bug Fixes

- **market-history:** harden against prototype pollution bugs ([#8079](https://github.com/ExodusMovement/exodus-hydra/issues/8079)) ([3715950](https://github.com/ExodusMovement/exodus-hydra/commit/3715950347c3228e7a156952430b6b1f41901847))

## [9.0.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@9.0.2...@exodus/market-history@9.0.3) (2024-07-25)

### Bug Fixes

- migrate definitions ([#8030](https://github.com/ExodusMovement/exodus-hydra/issues/8030)) ([d2dfde5](https://github.com/ExodusMovement/exodus-hydra/commit/d2dfde55dfa843eb52842f64b3aac3a6f9a59069))

## [9.0.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@9.0.1...@exodus/market-history@9.0.2) (2024-07-18)

**Note:** Version bump only for package @exodus/market-history

## [9.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@9.0.0...@exodus/market-history@9.0.1) (2024-07-11)

### Bug Fixes

- missing current time ([#7786](https://github.com/ExodusMovement/exodus-hydra/issues/7786)) ([aeb6c8b](https://github.com/ExodusMovement/exodus-hydra/commit/aeb6c8b69265ec38e0829d07110f42ab79aeb00c))

## [9.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@8.0.0...@exodus/market-history@9.0.0) (2024-06-25)

### ⚠ BREAKING CHANGES

- add ability to fetch more prices (#7465)

### Features

- add ability to fetch more prices ([#7465](https://github.com/ExodusMovement/exodus-hydra/issues/7465)) ([f910eb9](https://github.com/ExodusMovement/exodus-hydra/commit/f910eb9bd7d8ffa1b18c3714e6247b3a59df002b))

## [8.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@7.4.1...@exodus/market-history@8.0.0) (2024-06-20)

### ⚠ BREAKING CHANGES

- market-history support request limits from config (#7455)

### Features

- market-history support request limits from config ([#7455](https://github.com/ExodusMovement/exodus-hydra/issues/7455)) ([2d2e4de](https://github.com/ExodusMovement/exodus-hydra/commit/2d2e4de66e10056499c054813035e68a15dd0072))
- **market-history:** bump @exodus/price-api ([#7448](https://github.com/ExodusMovement/exodus-hydra/issues/7448)) ([0d0b95f](https://github.com/ExodusMovement/exodus-hydra/commit/0d0b95fec9eccf3de993c225a46701f8d2f7560f))

## [7.4.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@7.4.0...@exodus/market-history@7.4.1) (2024-06-11)

### Bug Fixes

- **pricing:** increase market history jitter ([#7332](https://github.com/ExodusMovement/exodus-hydra/issues/7332)) ([fdd2c24](https://github.com/ExodusMovement/exodus-hydra/commit/fdd2c24b60f7761956bc5d52d225d523ad8be52b))

## [7.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@7.3.1...@exodus/market-history@7.4.0) (2024-03-01)

### Features

- add marketHistory feature default config ([#5929](https://github.com/ExodusMovement/exodus-hydra/issues/5929)) ([ff746b7](https://github.com/ExodusMovement/exodus-hydra/commit/ff746b7f13dd72b033ae22d3d7b9e3991906f7d3))

### Bug Fixes

- missing dependencies ([#5322](https://github.com/ExodusMovement/exodus-hydra/issues/5322)) ([01efedc](https://github.com/ExodusMovement/exodus-hydra/commit/01efedc7508fb14925277fdcd388afb721ac3dd1))

## [7.3.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@7.3.0...@exodus/market-history@7.3.1) (2024-01-04)

### Bug Fixes

- **@exodus/market-history:** handle going to background from, both active and inactive modes ([#5253](https://github.com/ExodusMovement/exodus-hydra/issues/5253)) ([60120d3](https://github.com/ExodusMovement/exodus-hydra/commit/60120d32c34cf9822c6a1017c702c8a7f19a726e))

## [7.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@7.2.0...@exodus/market-history@7.3.0) (2024-01-02)

### Features

- **market-history:** stop callback to cancel interval repeat fetching ([#5001](https://github.com/ExodusMovement/exodus-hydra/issues/5001)) ([0be7744](https://github.com/ExodusMovement/exodus-hydra/commit/0be774435d110021f219baaf63a058bb06575539))

## [7.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@7.1.0...@exodus/market-history@7.2.0) (2023-12-08)

### Features

- **market-history:** update when coming back from background ([#4974](https://github.com/ExodusMovement/exodus-hydra/issues/4974)) ([7da86fd](https://github.com/ExodusMovement/exodus-hydra/commit/7da86fdd3d3627c9f89ae8b50adf24b5f77eb47b))

## [7.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@7.0.0...@exodus/market-history@7.1.0) (2023-08-29)

### Features

- additional loading selectors ([#3708](https://github.com/ExodusMovement/exodus-hydra/issues/3708)) ([a18bcb4](https://github.com/ExodusMovement/exodus-hydra/commit/a18bcb474c668f53e9d48cd5fb762016146e41dd))

## [7.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@6.0.0...@exodus/market-history@7.0.0) (2023-08-29)

### ⚠ BREAKING CHANGES

- use time selector (#3699)

### Features

- observe marketHistoryAtom ([#3701](https://github.com/ExodusMovement/exodus-hydra/issues/3701)) ([1cb6927](https://github.com/ExodusMovement/exodus-hydra/commit/1cb69274319a00ca179cca59e482fda8c0954dbf))
- use time selector ([#3699](https://github.com/ExodusMovement/exodus-hydra/issues/3699)) ([294704b](https://github.com/ExodusMovement/exodus-hydra/commit/294704bbfebf5753d5489ce9537ef5f8592ffe43))

## [6.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@5.5.0...@exodus/market-history@6.0.0) (2023-08-25)

### ⚠ BREAKING CHANGES

- emit rates from plugin (#3572)
- remove store and actions from setup redux (#3575)

### Features

- emit rates from plugin ([#3572](https://github.com/ExodusMovement/exodus-hydra/issues/3572)) ([ae25681](https://github.com/ExodusMovement/exodus-hydra/commit/ae25681940138927581efe32740125571f9a71ae))

### Code Refactoring

- remove store and actions from setup redux ([#3575](https://github.com/ExodusMovement/exodus-hydra/issues/3575)) ([64fa4a6](https://github.com/ExodusMovement/exodus-hydra/commit/64fa4a6c2b69409a81ab140adbdf84646f1be73a))

## [5.5.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@5.4.0...@exodus/market-history@5.5.0) (2023-08-23)

### Features

- use assets redux module for assets selectors ([#3558](https://github.com/ExodusMovement/exodus-hydra/issues/3558)) ([4723c81](https://github.com/ExodusMovement/exodus-hydra/commit/4723c81f16d5915748e61ab51570b42bc89764f7))

## [5.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@5.3.0...@exodus/market-history@5.4.0) (2023-08-22)

### Features

- get-price-with-fallback ([#3502](https://github.com/ExodusMovement/exodus-hydra/issues/3502)) ([a816c1d](https://github.com/ExodusMovement/exodus-hydra/commit/a816c1d9bf259119d962ce53d41f9b5087e821b4))

## [5.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@5.2.0...@exodus/market-history@5.3.0) (2023-08-21)

### Features

- more market-history selectors ([#3476](https://github.com/ExodusMovement/exodus-hydra/issues/3476)) ([fb4a2c7](https://github.com/ExodusMovement/exodus-hydra/commit/fb4a2c72666016b8624269268eefa3755b599d86))

## [5.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@5.1.0...@exodus/market-history@5.2.0) (2023-08-21)

### Features

- **@exodus/market-history:** add api definition ([#3488](https://github.com/ExodusMovement/exodus-hydra/issues/3488)) ([b9b1e8b](https://github.com/ExodusMovement/exodus-hydra/commit/b9b1e8b9cb61d94ad21274883b18f2f08dc7db53))

## [5.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@5.0.1...@exodus/market-history@5.1.0) (2023-08-17)

### Features

- market-history-redux ([#3344](https://github.com/ExodusMovement/exodus-hydra/issues/3344)) ([3624808](https://github.com/ExodusMovement/exodus-hydra/commit/36248086e4cb61710ada6715289f6554b5e02c6e))
- more market-history selectors ([#3362](https://github.com/ExodusMovement/exodus-hydra/issues/3362)) ([7e1a3fb](https://github.com/ExodusMovement/exodus-hydra/commit/7e1a3fbb80df454867f8a47a08215f1d17a005f9))

### Bug Fixes

- add redux folder ([#3425](https://github.com/ExodusMovement/exodus-hydra/issues/3425)) ([84a42a7](https://github.com/ExodusMovement/exodus-hydra/commit/84a42a78d364f463c0d3cdb434bad079c3b38fa3))
- auto-fix lint issues ([#2443](https://github.com/ExodusMovement/exodus-hydra/issues/2443)) ([e280366](https://github.com/ExodusMovement/exodus-hydra/commit/e280366b53dabc25280fd16c9e44f812a10f3e65))

## [5.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@5.0.0...@exodus/market-history@5.0.1) (2023-07-07)

### Bug Fixes

- declare logger as dependency ([#2400](https://github.com/ExodusMovement/exodus-hydra/issues/2400)) ([b12c3fb](https://github.com/ExodusMovement/exodus-hydra/commit/b12c3fb20693feba3a6469834f64487e3f740874))

## [5.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@4.0.1...@exodus/market-history@5.0.0) (2023-07-06)

### ⚠ BREAKING CHANGES

- market-history feature (#2361)

### Features

- market-history feature ([#2361](https://github.com/ExodusMovement/exodus-hydra/issues/2361)) ([9132471](https://github.com/ExodusMovement/exodus-hydra/commit/9132471cafdf95f46760b6d4528e91210493cab1))

## [4.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@4.0.0...@exodus/market-history@4.0.1) (2023-07-05)

### Bug Fixes

- **market-history:** publish atoms dir ([#2287](https://github.com/ExodusMovement/exodus-hydra/issues/2287)) ([17349b1](https://github.com/ExodusMovement/exodus-hydra/commit/17349b1a1183598d5ee6033c0bbe7e7b9e56ceaa))

## [4.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@3.1.2...@exodus/market-history@4.0.0) (2023-07-05)

### ⚠ BREAKING CHANGES

- market-history atom (#2160)

### Features

- market-history atom ([#2160](https://github.com/ExodusMovement/exodus-hydra/issues/2160)) ([b74364a](https://github.com/ExodusMovement/exodus-hydra/commit/b74364a47e8a51b3eea6b8cc870c731def65726b))

## [3.1.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@3.1.1...@exodus/market-history@3.1.2) (2023-06-21)

**Note:** Version bump only for package @exodus/market-history

## [3.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@3.1.0...@exodus/market-history@3.1.1) (2023-05-24)

**Note:** Version bump only for package @exodus/market-history

## [3.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@3.0.1...@exodus/market-history@3.1.0) (2023-04-11)

### Features

- don't call setCache when no changes ([#1166](https://github.com/ExodusMovement/exodus-hydra/issues/1166)) ([522ce5d](https://github.com/ExodusMovement/exodus-hydra/commit/522ce5d18b2b79c170f50a43d5020f55149b3c93))

## [3.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@3.0.0...@exodus/market-history@3.0.1) (2023-03-23)

### Bug Fixes

- market-history fetchPricesInterval usage ([#1008](https://github.com/ExodusMovement/exodus-hydra/issues/1008)) ([43a4b80](https://github.com/ExodusMovement/exodus-hydra/commit/43a4b803ed205edc41d65cfd6b3dd71e3c875221))

## [3.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@2.0.1...@exodus/market-history@3.0.0) (2023-02-20)

### ⚠ BREAKING CHANGES

- use enabled assets in market history (#909)

### Features

- use enabled assets in market history ([#909](https://github.com/ExodusMovement/exodus-hydra/issues/909)) ([f19f65c](https://github.com/ExodusMovement/exodus-hydra/commit/f19f65c8139eb7096d5a8bf44521a428801094ee))

## [2.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/market-history@2.0.0...@exodus/market-history@2.0.1) (2023-02-15)

### Bug Fixes

- return all prices, not only fetched ([#890](https://github.com/ExodusMovement/exodus-hydra/issues/890)) ([684256c](https://github.com/ExodusMovement/exodus-hydra/commit/684256c2b92d71dbf1695370ae93274155fe7219))

## 1.1.0 (2023-01-24)

### Features

- add #/config per-key events ([#303](https://github.com/ExodusMovement/exodus-hydra/issues/303)) ([5391435](https://github.com/ExodusMovement/exodus-hydra/commit/539143598da10966ec18a93d9200542565682ecf))
- add `restricted-imports` eslint rule ([#719](https://github.com/ExodusMovement/exodus-hydra/issues/719)) ([175de9c](https://github.com/ExodusMovement/exodus-hydra/commit/175de9c19ec00e5a12441022c313837d58f38882))
- add market history monitor ([#206](https://github.com/ExodusMovement/exodus-hydra/issues/206)) ([121f026](https://github.com/ExodusMovement/exodus-hydra/commit/121f0268f2a3c5cb0a6a4b2788947714740a8c21))
- immediately show portfolio chart ([#1877](https://github.com/ExodusMovement/exodus-hydra/issues/1877)) ([ed6d9f6](https://github.com/ExodusMovement/exodus-hydra/commit/ed6d9f6e3daa3195fa6de1b91487315ac3282489))
- prevent monitors from running multiple times ([#497](https://github.com/ExodusMovement/exodus-hydra/issues/497)) ([81238ca](https://github.com/ExodusMovement/exodus-hydra/commit/81238cacaf893cb5019b5e02c481bcace1193f43))
- use real fusion sync in config ([#258](https://github.com/ExodusMovement/exodus-hydra/issues/258)) ([56f351c](https://github.com/ExodusMovement/exodus-hydra/commit/56f351cc18942499b47b5b3afecafaf181c2989b)), closes [#262](https://github.com/ExodusMovement/exodus-hydra/issues/262)

### Bug Fixes

- do not load rates on initial currency load ([#1548](https://github.com/ExodusMovement/exodus-hydra/issues/1548)) ([2eb5713](https://github.com/ExodusMovement/exodus-hydra/commit/2eb5713fe53ce3816a0857e917c1de6df91a15b2))
- do sync if started on start ([#766](https://github.com/ExodusMovement/exodus-hydra/issues/766)) ([1f19664](https://github.com/ExodusMovement/exodus-hydra/commit/1f19664bb8839328e6bb6ec9c9e965f78d8ae86b))
- fetch market-history prices for all assets, not only solana ([#829](https://github.com/ExodusMovement/exodus-hydra/issues/829)) ([36aa1d5](https://github.com/ExodusMovement/exodus-hydra/commit/36aa1d5dffb3773722bd930202be7c521fb71579))
- missing await ([#748](https://github.com/ExodusMovement/exodus-hydra/issues/748)) ([3f6b527](https://github.com/ExodusMovement/exodus-hydra/commit/3f6b527e04b7224324e9a2462c361a5c79816146))
- start monitors on popup re-open ([#249](https://github.com/ExodusMovement/exodus-hydra/issues/249)) ([2b6d257](https://github.com/ExodusMovement/exodus-hydra/commit/2b6d257eb5fd625801a695f6579b114509869750))
- use new sync event for local-config change ([#302](https://github.com/ExodusMovement/exodus-hydra/issues/302)) ([2042801](https://github.com/ExodusMovement/exodus-hydra/commit/2042801293b30f3347949f5bd687f665c7fa4ee9))

### Performance Improvements

- send less data from market prices module ([#1451](https://github.com/ExodusMovement/exodus-hydra/issues/1451)) ([eef3673](https://github.com/ExodusMovement/exodus-hydra/commit/eef3673c2dab332f4b1f071a001fccb0977b02c7))
