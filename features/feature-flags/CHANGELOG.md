# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [6.0.4](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/feature-flags@6.0.3...@exodus/feature-flags@6.0.4) (2024-09-09)

**Note:** Version bump only for package @exodus/feature-flags

## [6.0.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/feature-flags@6.0.2...@exodus/feature-flags@6.0.3) (2024-07-26)

### Bug Fixes

- mark optional configs as optional and remove unused configs ([#8075](https://github.com/ExodusMovement/exodus-hydra/issues/8075)) ([c1c990d](https://github.com/ExodusMovement/exodus-hydra/commit/c1c990dfcea35874d4bbc8429e97688e17977a9f))

## [6.0.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/feature-flags@6.0.1...@exodus/feature-flags@6.0.2) (2024-07-25)

### Bug Fixes

- migrate definitions ([#8030](https://github.com/ExodusMovement/exodus-hydra/issues/8030)) ([d2dfde5](https://github.com/ExodusMovement/exodus-hydra/commit/d2dfde55dfa843eb52842f64b3aac3a6f9a59069))

## [6.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/feature-flags@6.0.0...@exodus/feature-flags@6.0.1) (2024-07-18)

**Note:** Version bump only for package @exodus/feature-flags

## [6.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/feature-flags@5.1.0...@exodus/feature-flags@6.0.0) (2024-04-23)

### ⚠ BREAKING CHANGES

- accept config in featureFlags feature definition (#6493)

### Features

- accept config in featureFlags feature definition ([#6493](https://github.com/ExodusMovement/exodus-hydra/issues/6493)) ([1f1f194](https://github.com/ExodusMovement/exodus-hydra/commit/1f1f194f6c3abe2188c29dfbaf7e4133812964ba))
- support zero-conf for feature-flags ([#6508](https://github.com/ExodusMovement/exodus-hydra/issues/6508)) ([7896975](https://github.com/ExodusMovement/exodus-hydra/commit/78969752297b4bf6f44f623fb2fdd00a048c509c))
- type remaining API methods shipped with headless ([#6619](https://github.com/ExodusMovement/exodus-hydra/issues/6619)) ([d1ec08e](https://github.com/ExodusMovement/exodus-hydra/commit/d1ec08e695f0df2c9e63b01169c746ef872fe541))

## [5.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/feature-flags@5.0.0...@exodus/feature-flags@5.1.0) (2023-12-04)

### Features

- compute feature-is-enabled in geolocation ([#4939](https://github.com/ExodusMovement/exodus-hydra/issues/4939)) ([3a9bac6](https://github.com/ExodusMovement/exodus-hydra/commit/3a9bac6f1b3116f2849ca74ffae6be454e590acb)), closes [#4941](https://github.com/ExodusMovement/exodus-hydra/issues/4941)

## [5.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/feature-flags@4.2.0...@exodus/feature-flags@5.0.0) (2023-11-27)

### ⚠ BREAKING CHANGES

- reject feature flags with available:false + enabled:true (#4893)

### Features

- reject feature flags with available:false + enabled:true ([#4893](https://github.com/ExodusMovement/exodus-hydra/issues/4893)) ([487164f](https://github.com/ExodusMovement/exodus-hydra/commit/487164f5d3d6b1b088882e92735a3911e2a961ce))

### Bug Fixes

- cleanup subscriptions on stop ([#4591](https://github.com/ExodusMovement/exodus-hydra/issues/4591)) ([23c9e6b](https://github.com/ExodusMovement/exodus-hydra/commit/23c9e6b4a89a63754cfd4a01345e02758bf03794))

## [4.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/feature-flags@4.1.0...@exodus/feature-flags@4.2.0) (2023-09-18)

### Features

- add feature flags redux module ([#4093](https://github.com/ExodusMovement/exodus-hydra/issues/4093)) ([4b7b5c8](https://github.com/ExodusMovement/exodus-hydra/commit/4b7b5c8cf8854c32c77444390e7e630994261b69))

### Bug Fixes

- **feature-flags:** memoize and rename selectors ([#4099](https://github.com/ExodusMovement/exodus-hydra/issues/4099)) ([ba38b9d](https://github.com/ExodusMovement/exodus-hydra/commit/ba38b9d6ae71c125c59a697ae3bd21acc70e2e35))

## [4.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/feature-flags@4.0.0...@exodus/feature-flags@4.1.0) (2023-08-29)

### Features

- **feature-flags:** add atom observer ([#3691](https://github.com/ExodusMovement/exodus-hydra/issues/3691)) ([7444704](https://github.com/ExodusMovement/exodus-hydra/commit/744470412ea3e6241c43967e6214730e0f1dff38))

## [4.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/feature-flags@2.2.0...@exodus/feature-flags@4.0.0) (2023-07-25)

### ⚠ BREAKING CHANGES

- remote-config feature (#2899)

### Features

- move feature components from headless to package ([#2798](https://github.com/ExodusMovement/exodus-hydra/issues/2798)) ([8828342](https://github.com/ExodusMovement/exodus-hydra/commit/88283429129af938d382e51ee275ef7e655bdc87))
- remote-config feature ([#2899](https://github.com/ExodusMovement/exodus-hydra/issues/2899)) ([fcbe873](https://github.com/ExodusMovement/exodus-hydra/commit/fcbe87358e6258205ce969336ec4ab19e62f3270))
- remote-config module ([#2888](https://github.com/ExodusMovement/exodus-hydra/issues/2888)) ([8056a8b](https://github.com/ExodusMovement/exodus-hydra/commit/8056a8bc4f6ac05b107077a6668f2bc3f2a3824f))

## [3.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/feature-flags@2.2.0...@exodus/feature-flags@3.2.0) (2023-07-25)

### Features

- move feature components from headless to package ([#2798](https://github.com/ExodusMovement/exodus-hydra/issues/2798)) ([8828342](https://github.com/ExodusMovement/exodus-hydra/commit/88283429129af938d382e51ee275ef7e655bdc87))
- remote-config module ([#2888](https://github.com/ExodusMovement/exodus-hydra/issues/2888)) ([8056a8b](https://github.com/ExodusMovement/exodus-hydra/commit/8056a8bc4f6ac05b107077a6668f2bc3f2a3824f))

## [3.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/feature-flags@2.2.0...@exodus/feature-flags@3.1.0) (2023-07-21)

### Features

- move feature components from headless to package ([#2798](https://github.com/ExodusMovement/exodus-hydra/issues/2798)) ([8828342](https://github.com/ExodusMovement/exodus-hydra/commit/88283429129af938d382e51ee275ef7e655bdc87))

## [3.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/feature-flags@2.2.0...@exodus/feature-flags@3.0.0) (2023-07-21)

### ⚠ BREAKING CHANGES

- feature-flags feature (#2797)

### Features

- feature-flags feature ([#2797](https://github.com/ExodusMovement/exodus-hydra/issues/2797)) ([5137498](https://github.com/ExodusMovement/exodus-hydra/commit/51374984a45fbcc22d22d8c1da760b5afb613602))

## [2.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/feature-flags@2.1.2...@exodus/feature-flags@2.2.0) (2023-06-28)

### Features

- bump feature-control ([#2141](https://github.com/ExodusMovement/exodus-hydra/issues/2141)) ([4016a2d](https://github.com/ExodusMovement/exodus-hydra/commit/4016a2d0898d8340b53c7166e5906f438a57ad40))

## [2.1.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/feature-flags@2.1.1...@exodus/feature-flags@2.1.2) (2023-06-21)

### Performance Improvements

- prevent writing same value to atoms ([#2078](https://github.com/ExodusMovement/exodus-hydra/issues/2078)) ([bd901b4](https://github.com/ExodusMovement/exodus-hydra/commit/bd901b40a10c8983f2fe6fbb10c9dc8a81ccbd60))

## [2.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/feature-flags@2.1.0...@exodus/feature-flags@2.1.1) (2023-06-21)

### Performance Improvements

- dont set same value on observable again ([#2007](https://github.com/ExodusMovement/exodus-hydra/issues/2007)) ([3582c76](https://github.com/ExodusMovement/exodus-hydra/commit/3582c76fcfaebfc447c5ceb4d8be73ab28286047))

## [2.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/feature-flags@2.0.1...@exodus/feature-flags@2.1.0) (2023-06-08)

### Features

- add missing module clear methods ([#1851](https://github.com/ExodusMovement/exodus-hydra/issues/1851)) ([041a097](https://github.com/ExodusMovement/exodus-hydra/commit/041a0974b65232d2aa7d6d4926b0736817e9aa59))

## [2.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/feature-flags@2.0.0...@exodus/feature-flags@2.0.1) (2023-05-24)

### Bug Fixes

- combine atom shouldn't mutate ([#910](https://github.com/ExodusMovement/exodus-hydra/issues/910)) ([b7292cf](https://github.com/ExodusMovement/exodus-hydra/commit/b7292cfa033f3e1e396b4f0e5913ca347995c6cd))

## [2.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/feature-flags@1.0.0...@exodus/feature-flags@2.0.0) (2023-01-27)

### ⚠ BREAKING CHANGES

- feat!(feature-flags): add persisted flag param (#788)

### Features

- feat!(feature-flags): add persisted flag param (#788)

**Note:** Version bump only for package @exodus/feature-flags
