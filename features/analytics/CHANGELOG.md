# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [15.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@15.3.0...@exodus/analytics@15.4.0) (2025-06-03)

### Features

- feat: gracefully handle 'isLocked' state in report (#12669)

## [15.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@15.2.1...@exodus/analytics@15.3.0) (2025-05-12)

### Features

- feat: make analytics proper ESM, fix tests to mock modules (#12220)

## [15.2.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@15.2.0...@exodus/analytics@15.2.1) (2025-04-30)

### Bug Fixes

- fix: add missing multi-seed factory option (#12112)

## [15.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@15.1.3...@exodus/analytics@15.2.0) (2025-04-29)

### Features

- feat: make multi-seed related nodes and logic optional (#12108)

## [15.1.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@15.1.2...@exodus/analytics@15.1.3) (2025-03-19)

**Note:** Version bump only for package @exodus/analytics

## [15.1.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@15.1.1...@exodus/analytics@15.1.2) (2025-03-11)

**Note:** Version bump only for package @exodus/analytics

## [15.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@15.1.0...@exodus/analytics@15.1.1) (2025-02-21)

### Bug Fixes

- fix: skip exporting most reports if wallet doesn't exist (#11553)

## [15.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@15.0.0...@exodus/analytics@15.1.0) (2025-02-17)

### Features

- feat: analytics report (#11454)

### License

- license: re-license under MIT license (#10580)

## [15.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@15.0.0...@exodus/analytics@15.0.1) (2024-11-25)

### License

- license: re-license under MIT license (#10580)

## [15.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@14.4.2...@exodus/analytics@15.0.0) (2024-09-27)

### ⚠ BREAKING CHANGES

- remove isSoleWriter from storage atom factory (#9423)

### Features

- **analytics:** export type definitions and inline docs ([#9556](https://github.com/ExodusMovement/exodus-hydra/issues/9556)) ([286c2f2](https://github.com/ExodusMovement/exodus-hydra/commit/286c2f2e72e368592bf97484a42dc8ac5029ec22)), closes [#9557](https://github.com/ExodusMovement/exodus-hydra/issues/9557)
- remove isSoleWriter from storage atom factory ([#9423](https://github.com/ExodusMovement/exodus-hydra/issues/9423)) ([ab90ee1](https://github.com/ExodusMovement/exodus-hydra/commit/ab90ee13a819058c0f23c37008da2bebf4439157))

## [14.4.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@14.4.1...@exodus/analytics@14.4.2) (2024-09-16)

### Bug Fixes

- **analytics:** config ([#9306](https://github.com/ExodusMovement/exodus-hydra/issues/9306)) ([45a4a31](https://github.com/ExodusMovement/exodus-hydra/commit/45a4a31d8da36e6190381694ad3eb63488a29a64))

## [14.4.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@14.4.0...@exodus/analytics@14.4.1) (2024-09-09)

**Note:** Version bump only for package @exodus/analytics

## [14.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@14.3.0...@exodus/analytics@14.4.0) (2024-08-20)

### Features

- **analytics:** update @exodus/segment-metrics to ^4.0.1 ([#8567](https://github.com/ExodusMovement/exodus-hydra/issues/8567)) ([4f8d2bb](https://github.com/ExodusMovement/exodus-hydra/commit/4f8d2bb48e3a07632cf08e7a4274d971a872a275))

## [14.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@14.2.3...@exodus/analytics@14.3.0) (2024-08-19)

### Features

- **analytics:** update dependency segment-metrics ^3.0.0 => ^4.0.0 ([#8439](https://github.com/ExodusMovement/exodus-hydra/issues/8439)) ([1eab1a6](https://github.com/ExodusMovement/exodus-hydra/commit/1eab1a6c05dc5ea1cdbb5667697f8110e92b781f))

## [14.2.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@14.2.2...@exodus/analytics@14.2.3) (2024-08-14)

### Bug Fixes

- **analytics:** replace uuid with exodus/crypto ([#8405](https://github.com/ExodusMovement/exodus-hydra/issues/8405)) ([49efde7](https://github.com/ExodusMovement/exodus-hydra/commit/49efde7b75b45dd9f7c90d8eda3aa8547e0bc6d1))

## [14.2.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@14.2.1...@exodus/analytics@14.2.2) (2024-08-12)

### Bug Fixes

- analytics extra user ids not updated when adding/removing a seed ([#8296](https://github.com/ExodusMovement/exodus-hydra/issues/8296)) ([fcfeeae](https://github.com/ExodusMovement/exodus-hydra/commit/fcfeeaea9adeb6f79b0f69aeefbc8e6bb5f89f33))

## [14.2.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@14.2.0...@exodus/analytics@14.2.1) (2024-08-10)

### Bug Fixes

- **atoms:** invalidate cache on failed writes, adjust user id analytics atom API ([#8303](https://github.com/ExodusMovement/exodus-hydra/issues/8303)) ([17537a8](https://github.com/ExodusMovement/exodus-hydra/commit/17537a8b18aff90d5e7e1b12dd7964032af7b44b))
- **multi-seed:** consider only seed_src accounts on analytics atom ([#8255](https://github.com/ExodusMovement/exodus-hydra/issues/8255)) ([1fcf6d1](https://github.com/ExodusMovement/exodus-hydra/commit/1fcf6d13d21e9bb8916c85050fe37ee97ce5d924))

## [14.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@14.1.2...@exodus/analytics@14.2.0) (2024-08-06)

### Features

- reduce telemetry for screen renders ([#8195](https://github.com/ExodusMovement/exodus-hydra/issues/8195)) ([557b697](https://github.com/ExodusMovement/exodus-hydra/commit/557b69777d16d00e95c847f1b361b3c2325a5793))

## [14.1.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@14.1.1...@exodus/analytics@14.1.2) (2024-08-02)

### Bug Fixes

- **analytics:** remove storage related dependencies for analyticsExtraSeedsUserIdsAtomDefinition ([#8171](https://github.com/ExodusMovement/exodus-hydra/issues/8171)) ([f220b33](https://github.com/ExodusMovement/exodus-hydra/commit/f220b335d25bfcf3bd1531bd0d055972986e6ae4))

## [14.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@14.1.0...@exodus/analytics@14.1.1) (2024-07-31)

### Bug Fixes

- **analytics:** stop caching multi-seed user ids ([#8146](https://github.com/ExodusMovement/exodus-hydra/issues/8146)) ([9fd795e](https://github.com/ExodusMovement/exodus-hydra/commit/9fd795e156fdff5b0c52128c1c634f071e16798f))

## [14.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@14.0.0...@exodus/analytics@14.1.0) (2024-07-26)

### Features

- expand client tracking to all countries ([#8059](https://github.com/ExodusMovement/exodus-hydra/issues/8059)) ([bceac87](https://github.com/ExodusMovement/exodus-hydra/commit/bceac87ced09e28a335fd09dfa300c8782c79edd))

## [14.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@13.3.1...@exodus/analytics@14.0.0) (2024-07-25)

### ⚠ BREAKING CHANGES

- add default keyIdentifier to user ids atoms (#7989)

### Features

- add default keyIdentifier to user ids atoms ([#7989](https://github.com/ExodusMovement/exodus-hydra/issues/7989)) ([4380975](https://github.com/ExodusMovement/exodus-hydra/commit/4380975483c66900116494f54546970c4555a0f8))
- add user ids for extra seeds to every analytics call ([#7722](https://github.com/ExodusMovement/exodus-hydra/issues/7722)) ([3ff69a3](https://github.com/ExodusMovement/exodus-hydra/commit/3ff69a3e4fd2ec7d4ce8c3badc5b87b3e94820a8))

## [13.3.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@13.3.0...@exodus/analytics@13.3.1) (2024-07-25)

### Bug Fixes

- migrate definitions ([#8030](https://github.com/ExodusMovement/exodus-hydra/issues/8030)) ([d2dfde5](https://github.com/ExodusMovement/exodus-hydra/commit/d2dfde55dfa843eb52842f64b3aac3a6f9a59069))

## [13.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@13.2.1...@exodus/analytics@13.3.0) (2024-07-18)

### Features

- add analyticsExtraSeedsUserIdsAtom ([#7717](https://github.com/ExodusMovement/exodus-hydra/issues/7717)) ([241a6f1](https://github.com/ExodusMovement/exodus-hydra/commit/241a6f18d71ca597f23e17313d0b079ce099975f))

## [13.2.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@13.2.0...@exodus/analytics@13.2.1) (2024-07-18)

**Note:** Version bump only for package @exodus/analytics

## [13.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@13.1.1...@exodus/analytics@13.2.0) (2024-06-12)

### Features

- replace manual storage cache with enhancer ([#7143](https://github.com/ExodusMovement/exodus-hydra/issues/7143)) ([cc59bd9](https://github.com/ExodusMovement/exodus-hydra/commit/cc59bd9178a66e27febcd521f1164410ad91e2aa))

### Bug Fixes

- resolve race condtion with persisted events, use atoms ([#7339](https://github.com/ExodusMovement/exodus-hydra/issues/7339)) ([76e4988](https://github.com/ExodusMovement/exodus-hydra/commit/76e498897f12d14407882d0ca36ffdaa534babaa))

## [13.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@13.1.0...@exodus/analytics@13.1.1) (2024-05-22)

### Bug Fixes

- await analytics user id ([#7065](https://github.com/ExodusMovement/exodus-hydra/issues/7065)) ([53c91ef](https://github.com/ExodusMovement/exodus-hydra/commit/53c91effbefe3eadd66c4aa5ed890bacb1586573))

## [13.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@13.0.4...@exodus/analytics@13.1.0) (2024-05-21)

### Features

- make user analytics id atom storage backed atom ([#7023](https://github.com/ExodusMovement/exodus-hydra/issues/7023)) ([79cfa0e](https://github.com/ExodusMovement/exodus-hydra/commit/79cfa0e200211968064ea1ebe458ab37fa6330d6))

## [13.0.4](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@13.0.3...@exodus/analytics@13.0.4) (2024-05-10)

### Bug Fixes

- expose setDefaultEventProperties ([#6888](https://github.com/ExodusMovement/exodus-hydra/issues/6888)) ([3c1ce34](https://github.com/ExodusMovement/exodus-hydra/commit/3c1ce34e62081d5ad6042476ffe7b316380b63ab))

## [13.0.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@13.0.2...@exodus/analytics@13.0.3) (2024-05-10)

### Bug Fixes

- **analytics:** avoid flodding console with same warning ([#6408](https://github.com/ExodusMovement/exodus-hydra/issues/6408)) ([37b8ad1](https://github.com/ExodusMovement/exodus-hydra/commit/37b8ad143da7f6ee2d70d84b954f5c0ccc040923))
- expose requireDefaultEventProperties api ([#6880](https://github.com/ExodusMovement/exodus-hydra/issues/6880)) ([3a8c980](https://github.com/ExodusMovement/exodus-hydra/commit/3a8c980d1c0846888e4c8f2b5fbd4455ec435b2e))

## [13.0.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@13.0.1...@exodus/analytics@13.0.2) (2024-03-29)

### Bug Fixes

- get userId from analyticsUserIdAtom on postInstall ([#6251](https://github.com/ExodusMovement/exodus-hydra/issues/6251)) ([607dd15](https://github.com/ExodusMovement/exodus-hydra/commit/607dd15889047931dba3c52b3d6757aa56b1319f))

## [13.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@13.0.0...@exodus/analytics@13.0.1) (2024-03-08)

**Note:** Version bump only for package @exodus/analytics

## [13.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@12.0.2...@exodus/analytics@13.0.0) (2024-02-21)

### ⚠ BREAKING CHANGES

- support user id in multi-seed scenario (#5794)

### Features

- support user id in multi-seed scenario ([#5794](https://github.com/ExodusMovement/exodus-hydra/issues/5794)) ([7494e55](https://github.com/ExodusMovement/exodus-hydra/commit/7494e55254df71b95fa7adb575f9867c30b97b59))

## [12.0.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@12.0.1...@exodus/analytics@12.0.2) (2024-02-05)

**Note:** Version bump only for package @exodus/analytics

## [12.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@12.0.0...@exodus/analytics@12.0.1) (2024-01-26)

**Note:** Version bump only for package @exodus/analytics

## [12.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@11.0.0...@exodus/analytics@12.0.0) (2024-01-23)

### ⚠ BREAKING CHANGES

- **analytics:** userId and annonymousId usage (#5449)

### Bug Fixes

- **analytics:** userId and annonymousId usage ([#5449](https://github.com/ExodusMovement/exodus-hydra/issues/5449)) ([0198837](https://github.com/ExodusMovement/exodus-hydra/commit/01988377fb10c0bb76d473f7ea99f8d9222fe4d4))

## [11.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@10.3.0...@exodus/analytics@11.0.0) (2024-01-11)

### ⚠ BREAKING CHANGES

- add analytics.requireDefaultProperties (#5331)

### Features

- add analytics.requireDefaultProperties ([#5331](https://github.com/ExodusMovement/exodus-hydra/issues/5331)) ([e4a5e2c](https://github.com/ExodusMovement/exodus-hydra/commit/e4a5e2cd2907669cfae54c629aac357884ded82d))

## [10.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@10.2.0...@exodus/analytics@10.3.0) (2024-01-09)

### Features

- remove analytics.setExperiments and move it to feature ([#5313](https://github.com/ExodusMovement/exodus-hydra/issues/5313)) ([4e728f9](https://github.com/ExodusMovement/exodus-hydra/commit/4e728f9827a3b0611b1d91aee2dc89f2ccaed222))

### Bug Fixes

- `onStop` never possibly having a value ([#5082](https://github.com/ExodusMovement/exodus-hydra/issues/5082)) ([44b623d](https://github.com/ExodusMovement/exodus-hydra/commit/44b623d5ab782cd6b794b830f289364b246c3526))

## [10.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@10.1.0...@exodus/analytics@10.2.0) (2023-11-22)

### Features

- support optional `validateAnalyticsEvent` dep to override `validateEvent` ([#4850](https://github.com/ExodusMovement/exodus-hydra/issues/4850)) ([127a4cf](https://github.com/ExodusMovement/exodus-hydra/commit/127a4cf170d0fcb1c26f458946a3ef3aafeeb663))

### Bug Fixes

- cleanup subscriptions on stop ([#4591](https://github.com/ExodusMovement/exodus-hydra/issues/4591)) ([23c9e6b](https://github.com/ExodusMovement/exodus-hydra/commit/23c9e6b4a89a63754cfd4a01345e02758bf03794))

## [10.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@10.0.1...@exodus/analytics@10.1.0) (2023-10-24)

### Features

- **analytics:** use optin plugin ([#4560](https://github.com/ExodusMovement/exodus-hydra/issues/4560)) ([f4d9322](https://github.com/ExodusMovement/exodus-hydra/commit/f4d93228826dbdd4ad8e903b679af342c5463662))

### Bug Fixes

- **analytics:** set experiments plugin early return ([#4169](https://github.com/ExodusMovement/exodus-hydra/issues/4169)) ([d499779](https://github.com/ExodusMovement/exodus-hydra/commit/d4997792614fb29a2e617e50f5d91f92313b1d3e))
- don't block create/import in share activity plugin (resubmit ([#4359](https://github.com/ExodusMovement/exodus-hydra/issues/4359)) on master) ([#4377](https://github.com/ExodusMovement/exodus-hydra/issues/4377)) ([f17daa6](https://github.com/ExodusMovement/exodus-hydra/commit/f17daa697045f79123c1b747765648d0d92da21f))

## [10.0.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@10.0.1...@exodus/analytics@10.0.2) (2023-09-21)

### Bug Fixes

- **analytics:** set experiments plugin early return ([#4169](https://github.com/ExodusMovement/exodus-hydra/issues/4169)) ([d499779](https://github.com/ExodusMovement/exodus-hydra/commit/d4997792614fb29a2e617e50f5d91f92313b1d3e))

## [10.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@10.0.0...@exodus/analytics@10.0.1) (2023-09-14)

**Note:** Version bump only for package @exodus/analytics

## [10.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@9.0.0...@exodus/analytics@10.0.0) (2023-09-13)

### ⚠ BREAKING CHANGES

- **analytics:** redux module & plugin (#4037)

### Features

- **analytics:** redux module & plugin ([#4037](https://github.com/ExodusMovement/exodus-hydra/issues/4037)) ([80009b1](https://github.com/ExodusMovement/exodus-hydra/commit/80009b12de31c79d3132e0a73991369b83324419))

## [9.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@8.2.1...@exodus/analytics@9.0.0) (2023-09-13)

### ⚠ BREAKING CHANGES

- use injected fetchival (#3748)

### Features

- **analytics:** bump @exodus/analytics-validation ([#3969](https://github.com/ExodusMovement/exodus-hydra/issues/3969)) ([e9b020e](https://github.com/ExodusMovement/exodus-hydra/commit/e9b020e2ec1863b239b6f885c3b7c5752d3285b2))
- use injected fetchival ([#3748](https://github.com/ExodusMovement/exodus-hydra/issues/3748)) ([46b226b](https://github.com/ExodusMovement/exodus-hydra/commit/46b226ba28fdc0a600d0bc803eb7c4083d49f2d7))

### Bug Fixes

- **analytics:** share activity atom should default to false ([#3882](https://github.com/ExodusMovement/exodus-hydra/issues/3882)) ([ff63e76](https://github.com/ExodusMovement/exodus-hydra/commit/ff63e76d2f0af7309afa77afec0292ed684c1f31))

## [8.2.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@8.2.0...@exodus/analytics@8.2.1) (2023-08-17)

### Bug Fixes

- **analytics:** expose setDefaultPropertiesAsync, setExperiments api ([#3422](https://github.com/ExodusMovement/exodus-hydra/issues/3422)) ([9de2b49](https://github.com/ExodusMovement/exodus-hydra/commit/9de2b49a05f1d66b5bb9e444ef4d0eef525a6eb0))

## [8.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@8.1.0...@exodus/analytics@8.2.0) (2023-08-17)

### Features

- **analytics:** add setDefaultPropertiesAsync ([#3396](https://github.com/ExodusMovement/exodus-hydra/issues/3396)) ([beaa152](https://github.com/ExodusMovement/exodus-hydra/commit/beaa152d08dadc3acae9f4d665ea29a661297c93))

## [8.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@8.0.0...@exodus/analytics@8.1.0) (2023-08-08)

### Features

- **analytics:** set experiments plugin ([#3234](https://github.com/ExodusMovement/exodus-hydra/issues/3234)) ([566cb9f](https://github.com/ExodusMovement/exodus-hydra/commit/566cb9fc76d22834d6800d29aca4bd7aaa73c285))

## [8.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@7.1.0...@exodus/analytics@8.0.0) (2023-08-08)

### ⚠ BREAKING CHANGES

- analytics feature (#3202)

### Features

- add shareActivityAtom to analytics module ([#3214](https://github.com/ExodusMovement/exodus-hydra/issues/3214)) ([16f378d](https://github.com/ExodusMovement/exodus-hydra/commit/16f378d920eeda5bc4eeeb9a32906efc5f136cd4))
- ship analytics tracker with feature ([#3217](https://github.com/ExodusMovement/exodus-hydra/issues/3217)) ([f1ca98a](https://github.com/ExodusMovement/exodus-hydra/commit/f1ca98ae84038b6fb4ac0284d8ed662d48253d17))

### Bug Fixes

- use @exodus/fusion-atoms instead of @exodus/fusion/atoms ([#3228](https://github.com/ExodusMovement/exodus-hydra/issues/3228)) ([e700ab0](https://github.com/ExodusMovement/exodus-hydra/commit/e700ab0b886408e27ac2f30f75b570e6dcaf191d))

## [7.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@7.0.0...@exodus/analytics@7.1.0) (2023-06-26)

### Features

- **analytics:** add identify call ([#2110](https://github.com/ExodusMovement/exodus-hydra/issues/2110)) ([9030ef5](https://github.com/ExodusMovement/exodus-hydra/commit/9030ef5f9e4ff3bac958fd3fbd8e1168c6edcabc))

## [7.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@6.0.0...@exodus/analytics@7.0.0) (2023-06-05)

### ⚠ BREAKING CHANGES

- rm getAnonymousId, setPermanentUserId from analytics public API (#1733)

### Features

- **analytics:** allow setting metadata for sanitization errors ([#1751](https://github.com/ExodusMovement/exodus-hydra/issues/1751)) ([d2cb1fb](https://github.com/ExodusMovement/exodus-hydra/commit/d2cb1fbba45d857edf0ecfff0bbeb716b6f43f90))

### Code Refactoring

- rm getAnonymousId, setPermanentUserId from analytics public API ([#1733](https://github.com/ExodusMovement/exodus-hydra/issues/1733)) ([d6c1d33](https://github.com/ExodusMovement/exodus-hydra/commit/d6c1d33ce3a4e8b538accf19100d45848b9eb0e6))

## [6.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@5.0.1...@exodus/analytics@6.0.0) (2023-04-26)

### ⚠ BREAKING CHANGES

- **analytics:** let consumer inject config value (#1406)

### Bug Fixes

- **analytics:** let consumer inject config value ([#1406](https://github.com/ExodusMovement/exodus-hydra/issues/1406)) ([c54efb6](https://github.com/ExodusMovement/exodus-hydra/commit/c54efb6033d907dfbcbb0864afabff5f0e1fbda1))

## [5.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@5.0.0...@exodus/analytics@5.0.1) (2023-04-25)

**Note:** Version bump only for package @exodus/analytics

## [5.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@4.0.0...@exodus/analytics@5.0.0) (2023-04-14)

### ⚠ BREAKING CHANGES

- **analytics:** remove validation (#1254)

### Code Refactoring

- **analytics:** remove validation ([#1254](https://github.com/ExodusMovement/exodus-hydra/issues/1254)) ([71eebca](https://github.com/ExodusMovement/exodus-hydra/commit/71eebca2d3652e65a03d3b513699aacc0f6b8b45))

## [4.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@3.0.0...@exodus/analytics@4.0.0) (2023-04-10)

### ⚠ BREAKING CHANGES

- **analytics:** split connect into flush and setPermanentUserId (#1141)

### Bug Fixes

- **analytics:** restore event persistence ([#1131](https://github.com/ExodusMovement/exodus-hydra/issues/1131)) ([4d6ed67](https://github.com/ExodusMovement/exodus-hydra/commit/4d6ed67252840c1fac09715a27396d459a86bd1f))

### Code Refactoring

- **analytics:** split connect into flush and setPermanentUserId ([#1141](https://github.com/ExodusMovement/exodus-hydra/issues/1141)) ([27eebfa](https://github.com/ExodusMovement/exodus-hydra/commit/27eebfaf56e0db5c8ba83532a7964bb61ddc64ce))

## [3.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@2.1.0...@exodus/analytics@3.0.0) (2023-04-05)

### Features

- add event validation ([#1088](https://github.com/ExodusMovement/exodus-hydra/issues/1088)) ([58f9d1e](https://github.com/ExodusMovement/exodus-hydra/commit/58f9d1e49d4251aa98e803dc30adc80e98ed0e7e))
- decouple main schema with the `oneOf` and `discriminator` keywords ([#1122](https://github.com/ExodusMovement/exodus-hydra/issues/1122)) ([fb2f1ca](https://github.com/ExodusMovement/exodus-hydra/commit/fb2f1ca5639c369ab70aecc661009dd8b9fd8375))

## [2.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@2.0.0...@exodus/analytics@2.1.0) (2023-03-31)

### Features

- add seedDerivedId atom ([#1071](https://github.com/ExodusMovement/exodus-hydra/issues/1071)) ([05befdb](https://github.com/ExodusMovement/exodus-hydra/commit/05befdb525de7925b4bb5f0b544adbfeaf4641e3))

## [1.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@1.1.0...@exodus/analytics@1.2.0) (2023-01-31)

### Features

- add setExperiments function ([#798](https://github.com/ExodusMovement/exodus-hydra/issues/798)) ([e3c0a3e](https://github.com/ExodusMovement/exodus-hydra/commit/e3c0a3e468188b1bc4e77bbe90673736cbcd4db8))

## [1.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@1.0.2...@exodus/analytics@1.1.0) (2023-01-30)

### Features

- force flag for track/identify ([#794](https://github.com/ExodusMovement/exodus-hydra/issues/794)) ([7caa062](https://github.com/ExodusMovement/exodus-hydra/commit/7caa062476226ab78d6206ed09bc994f46dc4440))

## [1.0.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@1.0.1...@exodus/analytics@1.0.2) (2023-01-30)

**Note:** Version bump only for package @exodus/analytics

## [1.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/analytics@1.0.0...@exodus/analytics@1.0.1) (2023-01-30)

**Note:** Version bump only for package @exodus/analytics

## [0.1.1](https://github.com/ExodusMovement/analytics-base/compare/@exodus/analytics@0.1.0...@exodus/analytics@0.1.1) (2023-01-13)

### Bug Fixes

- **analytics:** remove peerDependencies ([#693](https://github.com/ExodusMovement/analytics-base/issues/693)) ([4b2665c](https://github.com/ExodusMovement/analytics-base/commit/4b2665c98940ba65452d2e06be771b3a4752c50e))
- track dont throw errors ([#689](https://github.com/ExodusMovement/analytics-base/issues/689)) ([04fe8e7](https://github.com/ExodusMovement/analytics-base/commit/04fe8e7a039b2a2e472208fb912092ae7081d494))

## 0.1.0 (2022-12-06)

### Features

- add analytics tracking via internal Segment library ([#450](https://github.com/ExodusMovement/analytics-base/issues/450)) ([52ef672](https://github.com/ExodusMovement/analytics-base/commit/52ef6722671e5dfbd5555670e829f520a3eeea1e))
- add tracker common properties, and conform tracking events to spec ([#555](https://github.com/ExodusMovement/analytics-base/issues/555)) ([72185e9](https://github.com/ExodusMovement/analytics-base/commit/72185e93de24995e44e7b40c3560d3ad383b4395))
- analytics portfolio properties ([#1409](https://github.com/ExodusMovement/analytics-base/issues/1409)) ([cafcf27](https://github.com/ExodusMovement/analytics-base/commit/cafcf2742b636f1b0b4a56b5c19570594f77abad))
- **analytics:** add traits support ([#542](https://github.com/ExodusMovement/analytics-base/issues/542)) ([f52c502](https://github.com/ExodusMovement/analytics-base/commit/f52c502c76c896172a83b0cf1ae314e758a05dd0))
- **analytics:** make `storage` parameter required ([#392](https://github.com/ExodusMovement/analytics-base/issues/392)) ([607c526](https://github.com/ExodusMovement/analytics-base/commit/607c526fdfbf7e3d39fa0d597157acf1154de054))
- **analytics:** support sending post install events ([#571](https://github.com/ExodusMovement/analytics-base/issues/571)) ([6337913](https://github.com/ExodusMovement/analytics-base/commit/63379135329e07aca3dedd973c890a74792a7288))
- **apps-connectivity:** add dapp analytics ([#1236](https://github.com/ExodusMovement/analytics-base/issues/1236)) ([70889bf](https://github.com/ExodusMovement/analytics-base/commit/70889bfe38e7b9057532ef39677e9154a2b3f11d))
- env constants ([#1464](https://github.com/ExodusMovement/analytics-base/issues/1464)) ([0b734b7](https://github.com/ExodusMovement/analytics-base/commit/0b734b7987ffcec175c222f031ee23c2d704f4fe))
- fiat tracking on browser ([#505](https://github.com/ExodusMovement/analytics-base/issues/505)) ([a7fe8d4](https://github.com/ExodusMovement/analytics-base/commit/a7fe8d418b1edd34d2657eac92c45f264ae85d48))
- preserve persisted telemetry events timestamps ([#1811](https://github.com/ExodusMovement/analytics-base/issues/1811)) ([55ad8d1](https://github.com/ExodusMovement/analytics-base/commit/55ad8d16dc915acff3f87792afa3ffad7a7067b8))
- track `chainChanged` Ethereum Provider events ([#2322](https://github.com/ExodusMovement/analytics-base/issues/2322)) ([7fcea46](https://github.com/ExodusMovement/analytics-base/commit/7fcea46d2ba0ab8d0295f1995bdeb52b12b6c4c5))
- track extension installation ([#2084](https://github.com/ExodusMovement/analytics-base/issues/2084)) ([b0f9d22](https://github.com/ExodusMovement/analytics-base/commit/b0f9d223fa9c85c828caa664d039364bdf1a296b))
- user navigates to buy crypto from the wallet page with a selected asset ([#1748](https://github.com/ExodusMovement/analytics-base/issues/1748)) ([4b2f633](https://github.com/ExodusMovement/analytics-base/commit/4b2f63375b70c6c89d2f919bcbe158a74047db8a))
- wire up analytics to privacy toggle ([#1006](https://github.com/ExodusMovement/analytics-base/issues/1006)) ([0fe567b](https://github.com/ExodusMovement/analytics-base/commit/0fe567bc1143e9ee837ac71fd32822eca5e9f720))
- wire up some analytics tracking ([#515](https://github.com/ExodusMovement/analytics-base/issues/515)) ([dbff9a1](https://github.com/ExodusMovement/analytics-base/commit/dbff9a1829635228ea27673e2c131713c8f04940))

### Bug Fixes

- add top up CTAs ([#2236](https://github.com/ExodusMovement/analytics-base/issues/2236)) ([cb73579](https://github.com/ExodusMovement/analytics-base/commit/cb735793b86353e33d80f0070a988f85725c6340))
- **analytics:** fix linting ([35da901](https://github.com/ExodusMovement/analytics-base/commit/35da901040249722080ca44a42b10acdb4e33c79))
- audit and correct all entry points to fiat ([#2106](https://github.com/ExodusMovement/analytics-base/issues/2106)) ([dbc46ac](https://github.com/ExodusMovement/analytics-base/commit/dbc46acc8bf7c137697e8b6636f1bf9132796708))
- **exodex:** misc issues with add funds cell in assets list ([#2424](https://github.com/ExodusMovement/analytics-base/issues/2424)) ([c27005f](https://github.com/ExodusMovement/analytics-base/commit/c27005f43e08d731c22e2fd9d3f76bfbbed6cd15))
- persist onboarding analytics events ([#1822](https://github.com/ExodusMovement/analytics-base/issues/1822)) ([8e9e027](https://github.com/ExodusMovement/analytics-base/commit/8e9e027b194a63cc80d60e66fbaf6b174d6a3840))

### Reverts

- Revert "refactor(analytics): accept atom instead of localConfig" ([f067cb9](https://github.com/ExodusMovement/analytics-base/commit/f067cb91b9c5d853d7c17b1a91da5b8fd8be52de))
