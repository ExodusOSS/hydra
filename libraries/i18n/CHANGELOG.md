# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [5.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/i18n@4.0.1...@exodus/i18n@5.0.0) (2024-11-04)

### ⚠ BREAKING CHANGES

- **i18n:** remove babel & webpack related functionality (#10320)

### Features

- **i18n:** remove babel & webpack related functionality ([#10320](https://github.com/ExodusMovement/exodus-hydra/issues/10320)) ([e66ae6e](https://github.com/ExodusMovement/exodus-hydra/commit/e66ae6e4e88a3ca8e4653877409847112904f422))

## [4.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/i18n@4.0.0...@exodus/i18n@4.0.1) (2024-09-27)

### Bug Fixes

- i18n extract action fails ([#9544](https://github.com/ExodusMovement/exodus-hydra/issues/9544)) ([6f70ddc](https://github.com/ExodusMovement/exodus-hydra/commit/6f70ddc65f80258640f30d42acaf9cfc3cd2117d))

## [4.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/i18n@3.8.3...@exodus/i18n@4.0.0) (2024-08-27)

### ⚠ BREAKING CHANGES

- migrate i18n to ESM (#8705)

### Code Refactoring

- migrate i18n to ESM ([#8705](https://github.com/ExodusMovement/exodus-hydra/issues/8705)) ([2ad942a](https://github.com/ExodusMovement/exodus-hydra/commit/2ad942af483e4b8a69daa14798f4e1f045ee08cb))

## [3.8.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/i18n@3.8.2...@exodus/i18n@3.8.3) (2023-11-13)

### Bug Fixes

- check all positions when interpolating in i18n ([#4755](https://github.com/ExodusMovement/exodus-hydra/issues/4755)) ([bff9ee2](https://github.com/ExodusMovement/exodus-hydra/commit/bff9ee20940fb893b66fbd75f4fdb8721ece60aa))

## [3.8.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/i18n@3.8.1...@exodus/i18n@3.8.2) (2023-11-08)

### Bug Fixes

- use i18n fallbacks when translation is invalid ([#4721](https://github.com/ExodusMovement/exodus-hydra/issues/4721)) ([85444d7](https://github.com/ExodusMovement/exodus-hydra/commit/85444d76ab70db39e9c2d7e9f6382c2801c3c5b0))

## [3.8.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/i18n@3.8.0...@exodus/i18n@3.8.1) (2023-11-08)

### Bug Fixes

- support numeric values in i18n when inlining po files ([#4716](https://github.com/ExodusMovement/exodus-hydra/issues/4716)) ([4cc39ad](https://github.com/ExodusMovement/exodus-hydra/commit/4cc39adebf60d222f032ace412a375d4d93f38b2))

## [3.8.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/i18n@3.7.0...@exodus/i18n@3.8.0) (2023-11-02)

### Features

- use robust ids for messages in i18n ([#4132](https://github.com/ExodusMovement/exodus-hydra/issues/4132)) ([aa8afdf](https://github.com/ExodusMovement/exodus-hydra/commit/aa8afdfdbd70b40dfa3f96af5b290bc9500e7a4f))

## [3.7.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/i18n@3.6.0...@exodus/i18n@3.7.0) (2023-10-20)

### Features

- **i18n:** force babel plugin not to preserve variable names ([#3949](https://github.com/ExodusMovement/exodus-hydra/issues/3949)) ([403e220](https://github.com/ExodusMovement/exodus-hydra/commit/403e2208c2b2d119fc7d4bb0329e3126a1f8fcf5))

### Bug Fixes

- **i18n:** handle default import when transforming ([#4516](https://github.com/ExodusMovement/exodus-hydra/issues/4516)) ([31ed474](https://github.com/ExodusMovement/exodus-hydra/commit/31ed47410157ee1e72d8aa454af553e14a73e576))

## [3.6.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/i18n@3.5.3...@exodus/i18n@3.6.0) (2023-08-22)

### Features

- add ignore regex to i18n config ([#3467](https://github.com/ExodusMovement/exodus-hydra/issues/3467)) ([8b0d866](https://github.com/ExodusMovement/exodus-hydra/commit/8b0d866f5ced37768415cf4f574a8c61972ee70c))

## [3.5.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/i18n@3.5.2...@exodus/i18n@3.5.3) (2023-08-18)

### Bug Fixes

- **localization:** include \_local_modules folder for translation ([#3442](https://github.com/ExodusMovement/exodus-hydra/issues/3442)) ([8cabfda](https://github.com/ExodusMovement/exodus-hydra/commit/8cabfdad7826d871b413784552a5fc2da53506c4))

## [3.5.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/i18n@3.5.1...@exodus/i18n@3.5.2) (2023-08-17)

### Bug Fixes

- transform i18n fns only with decorator ([#3436](https://github.com/ExodusMovement/exodus-hydra/issues/3436)) ([56c23fd](https://github.com/ExodusMovement/exodus-hydra/commit/56c23fd910be6ced38c072500e746bef4fe1b61e))

## [3.5.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/i18n@3.5.0...@exodus/i18n@3.5.1) (2023-08-15)

**Note:** Version bump only for package @exodus/i18n

## [3.5.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/i18n@3.4.0...@exodus/i18n@3.5.0) (2023-08-14)

### Features

- extract i18n hoc from mobile ([#3340](https://github.com/ExodusMovement/exodus-hydra/issues/3340)) ([a2c3326](https://github.com/ExodusMovement/exodus-hydra/commit/a2c33261bfba9c22e75f5291cf0374f24df70463))
- **i18n:** add support for custom modules ([#3125](https://github.com/ExodusMovement/exodus-hydra/issues/3125)) ([91524b1](https://github.com/ExodusMovement/exodus-hydra/commit/91524b11bfda73fe8711ce00e1d8d15267f19350))
- **i18n:** add support for hoc decorators ([#3198](https://github.com/ExodusMovement/exodus-hydra/issues/3198)) ([bdba529](https://github.com/ExodusMovement/exodus-hydra/commit/bdba529a8f5b1e7f5f217d73c79caec947fd2b6a))

## [3.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/i18n@3.3.0...@exodus/i18n@3.4.0) (2023-08-01)

### Features

- extraction from multiple roots ([#3064](https://github.com/ExodusMovement/exodus-hydra/issues/3064)) ([ed9b761](https://github.com/ExodusMovement/exodus-hydra/commit/ed9b7619b7ce821f9176a8d88b12b840e0f8dfb2))

## [3.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/i18n@3.2.0...@exodus/i18n@3.3.0) (2023-07-31)

### Features

- add i18n server client ([#3050](https://github.com/ExodusMovement/exodus-hydra/issues/3050)) ([df0b0a2](https://github.com/ExodusMovement/exodus-hydra/commit/df0b0a26349841785e78f7cc0edd39262fb4ad88))
- kill `ssr` in favor of I18NStatic ([#3054](https://github.com/ExodusMovement/exodus-hydra/issues/3054)) ([4dc7c8d](https://github.com/ExodusMovement/exodus-hydra/commit/4dc7c8d1daaac36f2554d99103c51dfc2883ce5d))

## [3.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/i18n@3.1.0...@exodus/i18n@3.2.0) (2023-07-31)

### Features

- **i18n:** add static translations to i18n ([#3019](https://github.com/ExodusMovement/exodus-hydra/issues/3019)) ([efb487d](https://github.com/ExodusMovement/exodus-hydra/commit/efb487d07d489e3f4821f0ab376823077452ae2b))

## [3.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/i18n@3.0.5...@exodus/i18n@3.1.0) (2023-07-31)

### Features

- **i18n:** add ellipsis preprocessing ([#3034](https://github.com/ExodusMovement/exodus-hydra/issues/3034)) ([842d6aa](https://github.com/ExodusMovement/exodus-hydra/commit/842d6aa5160c712dc078bf3e9d00572c188b9ed7))
- **i18n:** disable bang preprocessing ([#3018](https://github.com/ExodusMovement/exodus-hydra/issues/3018)) ([e6e6027](https://github.com/ExodusMovement/exodus-hydra/commit/e6e60275a0176c8aa60d24eb2ca2a71347352ac3))

## [3.0.5](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/i18n@3.0.4...@exodus/i18n@3.0.5) (2023-07-25)

### Bug Fixes

- **i18n:** ensure param is an obejct ([#2921](https://github.com/ExodusMovement/exodus-hydra/issues/2921)) ([467000e](https://github.com/ExodusMovement/exodus-hydra/commit/467000e1da2306916e2c6a9610e513aed6004351))

## [3.0.4](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/i18n@3.0.3...@exodus/i18n@3.0.4) (2023-07-25)

### Bug Fixes

- add default for destructed T param ([#2917](https://github.com/ExodusMovement/exodus-hydra/issues/2917)) ([9d5cc9f](https://github.com/ExodusMovement/exodus-hydra/commit/9d5cc9f9ca7021cc9f05802ad401b764fec02182))

## [3.0.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/i18n@3.0.2...@exodus/i18n@3.0.3) (2023-07-25)

### Bug Fixes

- update equality check on i18n interpolate ([#2913](https://github.com/ExodusMovement/exodus-hydra/issues/2913)) ([d4347a7](https://github.com/ExodusMovement/exodus-hydra/commit/d4347a7221c9af38200393dc91e7262466a6bf97))

## [3.0.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/i18n@3.0.1...@exodus/i18n@3.0.2) (2023-07-25)

### Code Refactoring

- validate i18n.translate does not throw ([#2910](https://github.com/ExodusMovement/exodus-hydra/issues/2910)) ([930e088])(https://github.com/ExodusMovement/exodus-hydra/pull/2910/commits/930e088c62533089a96f7652dd8698177a7e3554)

## [3.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/i18n@3.0.0...@exodus/i18n@3.0.1) (2023-06-16)

### Bug Fixes

- **i18n:** esm -> cjs export ([#1980](https://github.com/ExodusMovement/exodus-hydra/issues/1980)) ([769d37d](https://github.com/ExodusMovement/exodus-hydra/commit/769d37d4365c1b5232eec46ec6c84d9352f3e8b9))

## [3.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/i18n@2.0.5...@exodus/i18n@3.0.0) (2023-06-12)

### ⚠ BREAKING CHANGES

- i18n dedupe strings with punctuation (#1634)

### Features

- add i18n extract tests ([#1605](https://github.com/ExodusMovement/exodus-hydra/issues/1605)) ([96fa83d](https://github.com/ExodusMovement/exodus-hydra/commit/96fa83dae2da70da00c140b20dd896a77c017fcd))
- extract cjs `t` imports ([#1600](https://github.com/ExodusMovement/exodus-hydra/issues/1600)) ([ab77830](https://github.com/ExodusMovement/exodus-hydra/commit/ab77830ccfa00dded8b7882fb5f21e1994cdc45c))
- i18n dedupe strings with punctuation ([#1634](https://github.com/ExodusMovement/exodus-hydra/issues/1634)) ([fdd7868](https://github.com/ExodusMovement/exodus-hydra/commit/fdd7868ed975f1cfbc9a72c132b51f792365c675))

### Bug Fixes

- extract line number logic ([#1895](https://github.com/ExodusMovement/exodus-hydra/issues/1895)) ([97fdefb](https://github.com/ExodusMovement/exodus-hydra/commit/97fdefbf8cbbdc458dfe56b03694eec7f26f75ee))

## [2.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/i18n@2.0.5...@exodus/i18n@2.1.0) (2023-05-10)

### Features

- extract cjs `t` imports ([#1600](https://github.com/ExodusMovement/exodus-hydra/issues/1600)) ([ab77830](https://github.com/ExodusMovement/exodus-hydra/commit/ab77830ccfa00dded8b7882fb5f21e1994cdc45c))

## [2.0.5](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/i18n@2.0.4...@exodus/i18n@2.0.5) (2023-05-01)

### Bug Fixes

- inline-po-plugin to compile template literals ([#1441](https://github.com/ExodusMovement/exodus-hydra/issues/1441)) ([b64d225](https://github.com/ExodusMovement/exodus-hydra/commit/b64d225ec56162576bca6b4ffbc59babeedc7679))

## [2.0.4](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/i18n@2.0.3...@exodus/i18n@2.0.4) (2023-04-26)

### Bug Fixes

- improve some regexes ([#1407](https://github.com/ExodusMovement/exodus-hydra/issues/1407)) ([26ab285](https://github.com/ExodusMovement/exodus-hydra/commit/26ab285be276658e2b0887c8bec6c5cb23340774))

## [2.0.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/i18n@2.0.2...@exodus/i18n@2.0.3) (2023-04-14)

### Bug Fixes

- only apply whitelisted plugins ([#1246](https://github.com/ExodusMovement/exodus-hydra/issues/1246)) ([e0d4d58](https://github.com/ExodusMovement/exodus-hydra/commit/e0d4d58950b41260086f0fdbeeb76890abc448d5))

## [2.0.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/i18n@2.0.1...@exodus/i18n@2.0.2) (2023-04-14)

### Bug Fixes

- use plugins with qualified paths from babel.config.js ([#1242](https://github.com/ExodusMovement/exodus-hydra/issues/1242)) ([c121374](https://github.com/ExodusMovement/exodus-hydra/commit/c1213742ed9d468f1b4a7fc88d1f70470d1036d7))

## [2.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/i18n@2.0.0...@exodus/i18n@2.0.1) (2023-04-14)

### Bug Fixes

- import path for transform plugin ([#1240](https://github.com/ExodusMovement/exodus-hydra/issues/1240)) ([c2104b4](https://github.com/ExodusMovement/exodus-hydra/commit/c2104b442adbf3f160dd028121440d3f594b6ae3))

## [2.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/i18n@1.0.2...@exodus/i18n@2.0.0) (2023-04-14)

### ⚠ BREAKING CHANGES

- add babel plugin to inline po files (#1237)

### Features

- add babel plugin to inline po files ([#1237](https://github.com/ExodusMovement/exodus-hydra/issues/1237)) ([d30599d](https://github.com/ExodusMovement/exodus-hydra/commit/d30599d69092fd5e6479830f14062de1bafa9450))

## [1.0.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/i18n@1.0.1...@exodus/i18n@1.0.2) (2023-04-13)

### Bug Fixes

- remove moduleName parameter ([#1209](https://github.com/ExodusMovement/exodus-hydra/issues/1209)) ([08f092d](https://github.com/ExodusMovement/exodus-hydra/commit/08f092dc15146a25d7bc20f23814a358a4eef148))

## [1.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/i18n@1.0.0...@exodus/i18n@1.0.1) (2023-04-13)

### Bug Fixes

- declare dependencies ([#1207](https://github.com/ExodusMovement/exodus-hydra/issues/1207)) ([299aa0a](https://github.com/ExodusMovement/exodus-hydra/commit/299aa0a6ff8494c1b00a420b681c8a4d6ed2f2a4))
