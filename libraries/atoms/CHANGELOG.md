# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [9.0.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@9.0.2...@exodus/atoms@9.0.3) (2025-04-30)

### Bug Fixes

- fix: disable memoization in compute atom enhancer (#12127)

## [9.0.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@9.0.1...@exodus/atoms@9.0.2) (2025-03-19)

**Note:** Version bump only for package @exodus/atoms

## [9.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@9.0.0...@exodus/atoms@9.0.1) (2025-01-31)

### Bug Fixes

- fix: reset call state after atom reset (#11306)

### Performance

- perf(atoms): memoize compute enhancer selectors (#10771)

## [9.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@8.1.1...@exodus/atoms@9.0.0) (2024-09-26)

### ⚠ BREAKING CHANGES

- remove isSoleWriter from storage atom factory (#9423)

### Features

- don't allow get to proceed after unsubscribe ([#9441](https://github.com/ExodusMovement/exodus-hydra/issues/9441)) ([33bc642](https://github.com/ExodusMovement/exodus-hydra/commit/33bc642ad6ec32e1f31711f9dfe435d235eaca56))
- remove isSoleWriter from storage atom factory ([#9423](https://github.com/ExodusMovement/exodus-hydra/issues/9423)) ([ab90ee1](https://github.com/ExodusMovement/exodus-hydra/commit/ab90ee13a819058c0f23c37008da2bebf4439157))

### Bug Fixes

- storage atom race condition ([#9403](https://github.com/ExodusMovement/exodus-hydra/issues/9403)) ([bf30d0c](https://github.com/ExodusMovement/exodus-hydra/commit/bf30d0cc90632459b6b0b9fd76fac191d20ddd0b))

### Performance Improvements

- reduce underlying storage reads ([#9418](https://github.com/ExodusMovement/exodus-hydra/issues/9418)) ([f3c0c23](https://github.com/ExodusMovement/exodus-hydra/commit/f3c0c232b120977a27565636f4d1a6ca9fc90b4a))

## [8.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@8.1.0...@exodus/atoms@8.1.1) (2024-09-09)

### Bug Fixes

- **atoms:** actively clear cache upon reset ([#8709](https://github.com/ExodusMovement/exodus-hydra/issues/8709)) ([d159c00](https://github.com/ExodusMovement/exodus-hydra/commit/d159c0020519379a4b477a52b82494b6f93c704e))

## [8.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@8.0.0...@exodus/atoms@8.1.0) (2024-08-10)

### Features

- **atoms:** warn when using cache enhancer on atom with no setter ([#8147](https://github.com/ExodusMovement/exodus-hydra/issues/8147)) ([1511a55](https://github.com/ExodusMovement/exodus-hydra/commit/1511a5528cce33d82795b4eb06385de370e7a847))

### Bug Fixes

- **atoms:** invalidate cache on failed writes, adjust user id analytics atom API ([#8303](https://github.com/ExodusMovement/exodus-hydra/issues/8303)) ([17537a8](https://github.com/ExodusMovement/exodus-hydra/commit/17537a8b18aff90d5e7e1b12dd7964032af7b44b))

## [8.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@7.6.1...@exodus/atoms@8.0.0) (2024-07-17)

### ⚠ BREAKING CHANGES

- extract remote config atoms (#7817)

### Features

- **enhancers:** add compute asynchronous selector support ([#7873](https://github.com/ExodusMovement/exodus-hydra/issues/7873)) ([e62576e](https://github.com/ExodusMovement/exodus-hydra/commit/e62576e5a257f012a184e75a505c2381cc42e07c))
- extract remote config atoms ([#7817](https://github.com/ExodusMovement/exodus-hydra/issues/7817)) ([7c67be4](https://github.com/ExodusMovement/exodus-hydra/commit/7c67be43e1cdd8376cbf211a64e3fec9b049b90b))

## [7.6.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@7.6.0...@exodus/atoms@7.6.1) (2024-07-09)

**Note:** Version bump only for package @exodus/atoms

## [7.6.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@7.5.1...@exodus/atoms@7.6.0) (2024-07-05)

### Features

- use safe stringify ([#7653](https://github.com/ExodusMovement/exodus-hydra/issues/7653)) ([a3d922d](https://github.com/ExodusMovement/exodus-hydra/commit/a3d922d48911d963361b896f6bcefa1dc9e255aa))

### Bug Fixes

- use default import from lodash ([#7611](https://github.com/ExodusMovement/exodus-hydra/issues/7611)) ([2e83743](https://github.com/ExodusMovement/exodus-hydra/commit/2e8374308f290e24f22e8e41b99be7b7a83d6365))

## [7.5.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@7.5.0...@exodus/atoms@7.5.1) (2024-07-02)

**Note:** Version bump only for package @exodus/atoms

## [7.5.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@7.4.1...@exodus/atoms@7.5.0) (2024-06-20)

### Features

- add `filter` enhancer ([#7454](https://github.com/ExodusMovement/exodus-hydra/issues/7454)) ([0d43258](https://github.com/ExodusMovement/exodus-hydra/commit/0d43258ecdfa11a63a1143732934594bad711a34))

## [7.4.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@7.4.0...@exodus/atoms@7.4.1) (2024-05-27)

### Bug Fixes

- use isSoleWritter when creating cache atom ([#7144](https://github.com/ExodusMovement/exodus-hydra/issues/7144)) ([f056c24](https://github.com/ExodusMovement/exodus-hydra/commit/f056c24facf36320a3e3a9f9fd05cf9f03c092bd))

## [7.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@7.3.3...@exodus/atoms@7.4.0) (2024-05-24)

### Features

- add storage cache atom enhancer ([#7083](https://github.com/ExodusMovement/exodus-hydra/issues/7083)) ([3983ac6](https://github.com/ExodusMovement/exodus-hydra/commit/3983ac610808a0d70b106829998362dd3b52c263))

## [7.3.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@7.3.2...@exodus/atoms@7.3.3) (2024-05-17)

### Bug Fixes

- relax type for atom supplied to compute ([#6995](https://github.com/ExodusMovement/exodus-hydra/issues/6995)) ([929c5aa](https://github.com/ExodusMovement/exodus-hydra/commit/929c5aad1a2a3b05369068bdeeac7f5e84184696))

## [7.3.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@7.3.1...@exodus/atoms@7.3.2) (2024-05-09)

### Bug Fixes

- prevent storage atoms of flooding reads on boot ([#6877](https://github.com/ExodusMovement/exodus-hydra/issues/6877)) ([23c1e79](https://github.com/ExodusMovement/exodus-hydra/commit/23c1e798808ac7417e151e627cb8fced5ef55454))

## [7.3.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@7.3.0...@exodus/atoms@7.3.1) (2024-05-09)

### Bug Fixes

- atoms should not hit storage after first read or write ([#6834](https://github.com/ExodusMovement/exodus-hydra/issues/6834)) ([63e23f1](https://github.com/ExodusMovement/exodus-hydra/commit/63e23f1f0bf33732f67b70feb9e95e854a8fd90e))

## [7.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@7.2.0...@exodus/atoms@7.3.0) (2024-04-17)

### Features

- don't proxyFreeze ReadonlySet and ReadonlyMap ([#6539](https://github.com/ExodusMovement/exodus-hydra/issues/6539)) ([ed7fa30](https://github.com/ExodusMovement/exodus-hydra/commit/ed7fa30b715df0ce3a1c551f3482988dbec3ec48))

## [7.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@7.1.0...@exodus/atoms@7.2.0) (2024-04-16)

### Features

- add `mergeWithValue` enhancer ([#6390](https://github.com/ExodusMovement/exodus-hydra/issues/6390)) ([125d708](https://github.com/ExodusMovement/exodus-hydra/commit/125d708bcf541c56248241fc921e53755c398671))

## [7.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@7.0.5...@exodus/atoms@7.1.0) (2024-04-15)

### Features

- add `atom.reset` ([#6461](https://github.com/ExodusMovement/exodus-hydra/issues/6461)) ([f687e48](https://github.com/ExodusMovement/exodus-hydra/commit/f687e4836dd36d478bde0dc3a86d481c40d15c78))

### Bug Fixes

- omit undefined from storage atom type when defaultValue set ([#6507](https://github.com/ExodusMovement/exodus-hydra/issues/6507)) ([2c8590c](https://github.com/ExodusMovement/exodus-hydra/commit/2c8590c5e2e6be30ab5df1d6702c37e14c5e76d5))

## [7.0.5](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@7.0.4...@exodus/atoms@7.0.5) (2024-02-28)

### Bug Fixes

- use true ESM for atoms ([#5897](https://github.com/ExodusMovement/exodus-hydra/issues/5897)) ([4f1dcf1](https://github.com/ExodusMovement/exodus-hydra/commit/4f1dcf17dd7b3351ad5e2f7c183be74e442f0078))

## [7.0.4](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@7.0.3...@exodus/atoms@7.0.4) (2024-02-22)

### Bug Fixes

- get atom value before checking time in observe ([#5804](https://github.com/ExodusMovement/exodus-hydra/issues/5804)) ([7791fbe](https://github.com/ExodusMovement/exodus-hydra/commit/7791fbea87c3f3e37434a6ba6bae5e1bac4b3cd4))

## [7.0.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@7.0.2...@exodus/atoms@7.0.3) (2024-02-21)

**Note:** Version bump only for package @exodus/atoms

## [7.0.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@7.0.1...@exodus/atoms@7.0.2) (2024-02-08)

### Bug Fixes

- **atoms:** get equality check ([#5206](https://github.com/ExodusMovement/exodus-hydra/issues/5206)) ([c3c7d69](https://github.com/ExodusMovement/exodus-hydra/commit/c3c7d69588c7c1fcc41093ee9877c4987ede6e92))

## [7.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@7.0.0...@exodus/atoms@7.0.1) (2024-01-09)

### Bug Fixes

- **atoms:** add missing dependency ([#5307](https://github.com/ExodusMovement/exodus-hydra/issues/5307)) ([5370c83](https://github.com/ExodusMovement/exodus-hydra/commit/5370c83fcd33f77801928a6ecd5b4ca74b26b4aa))

## [7.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@6.0.2...@exodus/atoms@7.0.0) (2023-12-10)

### ⚠ BREAKING CHANGES

- don't call serialize/deserialize on `undefined` in withSerialization (#4896)

### Features

- don't call serialize/deserialize on `undefined` in withSerialization ([#4896](https://github.com/ExodusMovement/exodus-hydra/issues/4896)) ([20a7a32](https://github.com/ExodusMovement/exodus-hydra/commit/20a7a321e00a527c94650222e45c0a970164c92c))

## [6.0.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@6.0.1...@exodus/atoms@6.0.2) (2023-11-30)

### Bug Fixes

- **atoms:** avoid observe-set loop caused by optimistic notifier ([#4932](https://github.com/ExodusMovement/exodus-hydra/issues/4932)) ([aced29b](https://github.com/ExodusMovement/exodus-hydra/commit/aced29bcd58c3aeb92653c14294cda29897ca3aa))
- valueEmittedFromGet !== undefined ([#4634](https://github.com/ExodusMovement/exodus-hydra/issues/4634)) ([89d185f](https://github.com/ExodusMovement/exodus-hydra/commit/89d185f7bafa2b604ea76219b3fab14e8845a43d))

## [6.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@6.0.0...@exodus/atoms@6.0.1) (2023-10-25)

### Bug Fixes

- **atom:** valueEmittedFromGet is not cleared in the observe ([#4566](https://github.com/ExodusMovement/exodus-hydra/issues/4566)) ([e1eb8a0](https://github.com/ExodusMovement/exodus-hydra/commit/e1eb8a0e690614c154c48cfed5dc5471eb06400a))

## [6.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@5.7.3...@exodus/atoms@6.0.0) (2023-10-21)

### ⚠ BREAKING CHANGES

- atoms to typescript (#4505)

### Bug Fixes

- dedupe enhancer when `set` called with function ([#4515](https://github.com/ExodusMovement/exodus-hydra/issues/4515)) ([ac63578](https://github.com/ExodusMovement/exodus-hydra/commit/ac6357880b5d14238bdcb1bd6a4d06a2b698fb58))

### Code Refactoring

- atoms to typescript ([#4505](https://github.com/ExodusMovement/exodus-hydra/issues/4505)) ([3873134](https://github.com/ExodusMovement/exodus-hydra/commit/3873134baacd69602d13e228be797eb7a96ad13e))

## [5.7.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@5.7.2...@exodus/atoms@5.7.3) (2023-10-20)

### Bug Fixes

- import from atoms index ([#4508](https://github.com/ExodusMovement/exodus-hydra/issues/4508)) ([923fb99](https://github.com/ExodusMovement/exodus-hydra/commit/923fb992328b63e45401c78176b5a6ef7b666eee))

## [5.7.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@5.7.1...@exodus/atoms@5.7.2) (2023-10-12)

### Bug Fixes

- **warn:** avoid android freeze due to JSON.stringify ([#4414](https://github.com/ExodusMovement/exodus-hydra/issues/4414)) ([b7fe284](https://github.com/ExodusMovement/exodus-hydra/commit/b7fe284573a2203bdf4753def4eddecfc6e50bec))

## [5.7.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@5.7.0...@exodus/atoms@5.7.1) (2023-09-20)

### Bug Fixes

- don't emit same obj ([#4148](https://github.com/ExodusMovement/exodus-hydra/issues/4148)) ([2d4db15](https://github.com/ExodusMovement/exodus-hydra/commit/2d4db15947b8888740bbc6df8c8677e5799dcd47))

## [5.7.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@5.6.0...@exodus/atoms@5.7.0) (2023-09-07)

### Features

- avoid notifying on unchanged values in dedupe ([#3876](https://github.com/ExodusMovement/exodus-hydra/issues/3876)) ([6cefcab](https://github.com/ExodusMovement/exodus-hydra/commit/6cefcab4ee01d45eecefac3d18a8aca18cbfe268))
- register atom observers on creation ([#3893](https://github.com/ExodusMovement/exodus-hydra/issues/3893)) ([19a21af](https://github.com/ExodusMovement/exodus-hydra/commit/19a21afd55f475a49284c4e82f72738df3dfd23c))

## [5.6.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@5.5.0...@exodus/atoms@5.6.0) (2023-08-29)

### Features

- add optimisticNotifier enhancer ([#3669](https://github.com/ExodusMovement/exodus-hydra/issues/3669)) ([19e194b](https://github.com/ExodusMovement/exodus-hydra/commit/19e194b9d3b9fa9ff7ef4da86e8064d518f48a27))

### Bug Fixes

- always get source value when no subscribers ([#3694](https://github.com/ExodusMovement/exodus-hydra/issues/3694)) ([a6ce256](https://github.com/ExodusMovement/exodus-hydra/commit/a6ce256ece91088f636e1d32db5b75621449302a))

## [5.5.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@5.4.0...@exodus/atoms@5.5.0) (2023-08-14)

### Features

- add atom observer factory ([#3308](https://github.com/ExodusMovement/exodus-hydra/issues/3308)) ([8407db8](https://github.com/ExodusMovement/exodus-hydra/commit/8407db824160fb6a89efd93c998d7c3448403719))

## [5.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@5.3.0...@exodus/atoms@5.4.0) (2023-08-01)

### Features

- shallow compare in compute ([#3061](https://github.com/ExodusMovement/exodus-hydra/issues/3061)) ([1a02017](https://github.com/ExodusMovement/exodus-hydra/commit/1a020179baeba69e0d662b171cb62106b1ace15c))

## [5.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@5.2.3...@exodus/atoms@5.3.0) (2023-07-27)

### Features

- remove limit for listeners on memory atoms ([#2982](https://github.com/ExodusMovement/exodus-hydra/issues/2982)) ([06a09e1](https://github.com/ExodusMovement/exodus-hydra/commit/06a09e179bb147a081461d15a380261e48a2d558))

## [5.2.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@5.2.2...@exodus/atoms@5.2.3) (2023-07-21)

### Bug Fixes

- dedupe to avoid fn form of set() for undefined values ([#2821](https://github.com/ExodusMovement/exodus-hydra/issues/2821)) ([2561416](https://github.com/ExodusMovement/exodus-hydra/commit/2561416b5e769f81b492ec5da4b37af6914ca0da))

## [5.2.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@5.2.1...@exodus/atoms@5.2.2) (2023-07-18)

### Bug Fixes

- **combine:** unsubscribe source atoms when no observers left ([#2208](https://github.com/ExodusMovement/exodus-hydra/issues/2208)) ([bb016ae](https://github.com/ExodusMovement/exodus-hydra/commit/bb016ae78bf81fed7b6a8beaa7469bc49d5f4d5b))
- storage atom wait write operation ([#2679](https://github.com/ExodusMovement/exodus-hydra/issues/2679)) ([1581f1e](https://github.com/ExodusMovement/exodus-hydra/commit/1581f1e2e5246ccecc6da73b6513c8e20142d609))

## [5.2.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@5.2.0...@exodus/atoms@5.2.1) (2023-06-30)

### Bug Fixes

- make atom.set concurrent ([#2182](https://github.com/ExodusMovement/exodus-hydra/issues/2182)) ([6e36f93](https://github.com/ExodusMovement/exodus-hydra/commit/6e36f93276c0d1d69092e62ba2aa3b97af7f10ef))

## [5.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@5.1.0...@exodus/atoms@5.2.0) (2023-06-23)

### Features

- **compute:** remove second argument of callback ([#2080](https://github.com/ExodusMovement/exodus-hydra/issues/2080)) ([4a42ab6](https://github.com/ExodusMovement/exodus-hydra/commit/4a42ab687f74496719d166f13bd2eaa3730fb9b6))

## [5.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@5.0.0...@exodus/atoms@5.1.0) (2023-06-21)

### Features

- add dedupe enhancer ([#2075](https://github.com/ExodusMovement/exodus-hydra/issues/2075)) ([e704008](https://github.com/ExodusMovement/exodus-hydra/commit/e704008818bdc057a7e94e97de4ff3085776660d))

## [5.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@4.0.1...@exodus/atoms@5.0.0) (2023-06-21)

### ⚠ BREAKING CHANGES

- remove fusion atom factory (#1983)
- remove local config factory (#1954)

### Features

- remove fusion atom factory ([#1983](https://github.com/ExodusMovement/exodus-hydra/issues/1983)) ([171e741](https://github.com/ExodusMovement/exodus-hydra/commit/171e7413479b8a8447d905af802aab29300b886b))

### Bug Fixes

- don't emit identical object again ([#2025](https://github.com/ExodusMovement/exodus-hydra/issues/2025)) ([e9ac6e4](https://github.com/ExodusMovement/exodus-hydra/commit/e9ac6e492cb0ea7293de62d5e6af500de15c429b))
- enforceObservableRules race conditions ([#2013](https://github.com/ExodusMovement/exodus-hydra/issues/2013)) ([a61be64](https://github.com/ExodusMovement/exodus-hydra/commit/a61be644755c12eab7e60de5590ca3e12001816b))
- get()/observe() race condition, difference statefulness ([#1975](https://github.com/ExodusMovement/exodus-hydra/issues/1975)) ([2bfacca](https://github.com/ExodusMovement/exodus-hydra/commit/2bfacca76d209707dd33e954b9bd636f8aba90d0))
- support function in `set` on `withSerialization` atom ([#2017](https://github.com/ExodusMovement/exodus-hydra/issues/2017)) ([e1240be](https://github.com/ExodusMovement/exodus-hydra/commit/e1240bed498249d5e730a6c35f6e188cf11d7a82))

### Performance Improvements

- dont set same value on observable again ([#2007](https://github.com/ExodusMovement/exodus-hydra/issues/2007)) ([3582c76](https://github.com/ExodusMovement/exodus-hydra/commit/3582c76fcfaebfc447c5ceb4d8be73ab28286047))

### Code Refactoring

- remove local config factory ([#1954](https://github.com/ExodusMovement/exodus-hydra/issues/1954)) ([77645a0](https://github.com/ExodusMovement/exodus-hydra/commit/77645a049829072339be9f1b16568605183d1106))

## [4.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@4.0.0...@exodus/atoms@4.0.1) (2023-06-13)

### Bug Fixes

- swallowObserverErrors and warnOnSameValueSet to avoid hanging atom.set() calls ([#1917](https://github.com/ExodusMovement/exodus-hydra/issues/1917)) ([a8e6d16](https://github.com/ExodusMovement/exodus-hydra/commit/a8e6d168495ba6876542a32136c88b1a5b6a9c77))

## [4.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@3.7.0...@exodus/atoms@4.0.0) (2023-06-12)

### ⚠ BREAKING CHANGES

- swallowObserverErrors enhancer (#1889)
- warnOnSameValueSet enhancer (#1888)

### Features

- swallowObserverErrors enhancer ([#1889](https://github.com/ExodusMovement/exodus-hydra/issues/1889)) ([1de1d05](https://github.com/ExodusMovement/exodus-hydra/commit/1de1d05cf33c1d1f2e5a6fdc0b9b1c894eb61749))
- timeout-observers enhancer ([#1890](https://github.com/ExodusMovement/exodus-hydra/issues/1890)) ([8528e4a](https://github.com/ExodusMovement/exodus-hydra/commit/8528e4a611c7c0ccc504f93e0bda36be281f88cd))
- warnOnSameValueSet enhancer ([#1888](https://github.com/ExodusMovement/exodus-hydra/issues/1888)) ([1504173](https://github.com/ExodusMovement/exodus-hydra/commit/15041732533988d5e85ad584499972de727938a8))

## [3.7.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@3.6.0...@exodus/atoms@3.7.0) (2023-06-06)

### Features

- add option to warn on same value set ([#1797](https://github.com/ExodusMovement/exodus-hydra/issues/1797)) ([47f749d](https://github.com/ExodusMovement/exodus-hydra/commit/47f749d495c53bf624b7169a86938079b8217965))

## [3.6.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@3.5.3...@exodus/atoms@3.6.0) (2023-05-25)

### Features

- support fn in atom.set(), a la react's setState ([#1691](https://github.com/ExodusMovement/exodus-hydra/issues/1691)) ([2aba2c1](https://github.com/ExodusMovement/exodus-hydra/commit/2aba2c106dfec5d847f0875ed660f4e7f42f7c60))

## [3.5.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@3.5.2...@exodus/atoms@3.5.3) (2023-05-12)

### Bug Fixes

- don't emit from atom till value resolved ([#1607](https://github.com/ExodusMovement/exodus-hydra/issues/1607)) ([fa54352](https://github.com/ExodusMovement/exodus-hydra/commit/fa54352c665bb2e1c43943f9a64697f669caaedb))
- master ci ([#1613](https://github.com/ExodusMovement/exodus-hydra/issues/1613)) ([44e3063](https://github.com/ExodusMovement/exodus-hydra/commit/44e306304338d5ce3cbc21757b6b3e91f5d95210))

## [3.5.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@3.5.1...@exodus/atoms@3.5.2) (2023-05-04)

### Bug Fixes

- wait till value defined ([#1520](https://github.com/ExodusMovement/exodus-hydra/issues/1520)) ([f0a657f](https://github.com/ExodusMovement/exodus-hydra/commit/f0a657ff9b0e571fc048f1e10da5a51ad3c2e431))

## [3.5.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@3.5.0...@exodus/atoms@3.5.1) (2023-04-25)

**Note:** Version bump only for package @exodus/atoms

## [3.5.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@3.4.1...@exodus/atoms@3.5.0) (2023-04-24)

### Features

- add sequenced keystore atom factory ([#1324](https://github.com/ExodusMovement/exodus-hydra/issues/1324)) ([6267665](https://github.com/ExodusMovement/exodus-hydra/commit/62676651a5bd9bbbf304acc09510c1bd89219f2b))

## [3.4.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@3.4.0...@exodus/atoms@3.4.1) (2023-04-19)

### Bug Fixes

- combine atoms enhancer ([#1296](https://github.com/ExodusMovement/exodus-hydra/issues/1296)) ([2b8de0d](https://github.com/ExodusMovement/exodus-hydra/commit/2b8de0dcec4ecbe5dd5e67f416835c3b687318f2))

## [3.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@3.3.0...@exodus/atoms@3.4.0) (2023-04-18)

### Features

- keystore atom ([#1286](https://github.com/ExodusMovement/exodus-hydra/issues/1286)) ([de02008](https://github.com/ExodusMovement/exodus-hydra/commit/de02008c67ffc28879d64b5a58b55194e15ab53d))

## [3.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@3.2.0...@exodus/atoms@3.3.0) (2023-04-10)

### Features

- atom/waitUntil ([#1142](https://github.com/ExodusMovement/exodus-hydra/issues/1142)) ([4432b3c](https://github.com/ExodusMovement/exodus-hydra/commit/4432b3c645f37fc1de002b845c4253a684235d3e))

## [3.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@3.1.0...@exodus/atoms@3.2.0) (2023-03-31)

### Features

- add seedDerivedId atom ([#1071](https://github.com/ExodusMovement/exodus-hydra/issues/1071)) ([05befdb](https://github.com/ExodusMovement/exodus-hydra/commit/05befdb525de7925b4bb5f0b544adbfeaf4641e3))

## [3.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@3.0.0...@exodus/atoms@3.1.0) (2023-03-17)

### Features

- support selector for remote-config atom ([#990](https://github.com/ExodusMovement/exodus-hydra/issues/990)) ([b4e7a3f](https://github.com/ExodusMovement/exodus-hydra/commit/b4e7a3f885b33ae7fe8d738e7ad95a80702df145))

## [3.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@2.10.0...@exodus/atoms@3.0.0) (2023-02-20)

### ⚠ BREAKING CHANGES

- enabled-assets to module/ atoms/ folders and auto-binding config (#801)

### Features

- add `restricted-imports` eslint rule ([#719](https://github.com/ExodusMovement/exodus-hydra/issues/719)) ([175de9c](https://github.com/ExodusMovement/exodus-hydra/commit/175de9c19ec00e5a12441022c313837d58f38882))

### Bug Fixes

- **atoms:** don't double proxy-freeze on observe init ([#797](https://github.com/ExodusMovement/exodus-hydra/issues/797)) ([1ea428f](https://github.com/ExodusMovement/exodus-hydra/commit/1ea428f159974c96898415cc71422c572c6ba84a))
- combine atom shouldn't mutate ([#910](https://github.com/ExodusMovement/exodus-hydra/issues/910)) ([b7292cf](https://github.com/ExodusMovement/exodus-hydra/commit/b7292cfa033f3e1e396b4f0e5913ca347995c6cd))

### Code Refactoring

- enabled-assets to module/ atoms/ folders and auto-binding config ([#801](https://github.com/ExodusMovement/exodus-hydra/issues/801)) ([24fe279](https://github.com/ExodusMovement/exodus-hydra/commit/24fe279ab1e0aeb4f557e4f5f6e841179cfd8c0e))

## [2.10.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@2.9.1...@exodus/atoms@2.10.0) (2022-12-21)

### Features

- add test for observe ([#595](https://github.com/ExodusMovement/exodus-hydra/issues/595)) ([279e14c](https://github.com/ExodusMovement/exodus-hydra/commit/279e14c76b4161dc1d6ce78af31dd9b8ff11c2f8))
- read-only atom enhancer ([#564](https://github.com/ExodusMovement/exodus-hydra/issues/564)) ([df83983](https://github.com/ExodusMovement/exodus-hydra/commit/df83983aad1678af7f69e13c7ca5e2edce72a3a0))
- use 'events' from node_modules ([#635](https://github.com/ExodusMovement/exodus-hydra/issues/635)) ([3f8376](https://github.com/ExodusMovement/exodus-hydra/commit/3f8376c760d7ca213345c9015562ac76eb205cb5))

## [2.9.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@2.9.0...@exodus/atoms@2.9.1) (2022-12-02)

### Bug Fixes

- export blockUntil from index ([e181d6c](https://github.com/ExodusMovement/exodus-hydra/commit/e181d6c219325a3d9bac1dabd4fbac0251049ce2))

## [2.9.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@2.8.0...@exodus/atoms@2.9.0) (2022-12-02)

### Features

- add blockUntil enhancer ([#557](https://github.com/ExodusMovement/exodus-hydra/issues/557)) ([ca69c6d](https://github.com/ExodusMovement/exodus-hydra/commit/ca69c6debeb05c31cbf6fb7dc4617b78526d42e6))

## [2.8.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@2.7.0...@exodus/atoms@2.8.0) (2022-12-01)

### Features

- combine atom ([#472](https://github.com/ExodusMovement/exodus-hydra/issues/472)) ([bd005a8](https://github.com/ExodusMovement/exodus-hydra/commit/bd005a893a126c360bb153c8e9309e9a63e14a14))

## [2.7.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@2.6.0...@exodus/atoms@2.7.0) (2022-11-29)

### Features

- allow in-memory atom without default ([#526](https://github.com/ExodusMovement/exodus-hydra/issues/526)) ([dfbb1a7](https://github.com/ExodusMovement/exodus-hydra/commit/dfbb1a703ed1be380c7cd881057e5dff4f55d3ba))

## [2.6.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@2.5.1...@exodus/atoms@2.6.0) (2022-11-18)

### Features

- add disabledAssets Atom to handle disabled unverified tokens ([#480](https://github.com/ExodusMovement/exodus-hydra/issues/480)) ([c69f575](https://github.com/ExodusMovement/exodus-hydra/commit/c69f57594c28879de9de4308ff71ae8c983f0a6d))

## [2.5.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@2.5.0...@exodus/atoms@2.5.1) (2022-11-02)

### Bug Fixes

- remove async from observe ([#403](https://github.com/ExodusMovement/exodus-hydra/issues/403)) ([fdcad8c](https://github.com/ExodusMovement/exodus-hydra/commit/fdcad8c7ddad0f304d331c963c4522a39413f55f))

### Performance Improvements

- cache values of storage atom if sole writer ([#399](https://github.com/ExodusMovement/exodus-hydra/issues/399)) ([5c065c9](https://github.com/ExodusMovement/exodus-hydra/commit/5c065c94d6e2922b152fcfd64da1cc7ee6d04d0d))

## [2.5.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@2.4.0...@exodus/atoms@2.5.0) (2022-10-27)

### Features

- add difference enhancer ([#380](https://github.com/ExodusMovement/exodus-hydra/issues/380)) ([8ff7a7d](https://github.com/ExodusMovement/exodus-hydra/commit/8ff7a7d9cd6d92e735d07f6904f0998f1b0c99fe))

## [2.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@2.2.1...@exodus/atoms@2.3.0) (2022-10-03)

### Features

- enabledAssetsAtom ([#265](https://github.com/ExodusMovement/exodus-hydra/issues/265)) ([cb3fe91](https://github.com/ExodusMovement/exodus-hydra/commit/cb3fe91d353945b812e34158872627d24d6f796e))

## [2.2.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@2.2.0...@exodus/atoms@2.2.1) (2022-08-22)

### Bug Fixes

- atoms package released files ([#194](https://github.com/ExodusMovement/exodus-hydra/issues/194)) ([ba90ab3](https://github.com/ExodusMovement/exodus-hydra/commit/ba90ab33ec02e7cd0b1b6367b045db34e278c700))

## [2.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@2.1.0...@exodus/atoms@2.2.0) (2022-08-22)

### Features

- add compute and serialization atom enhancers ([#189](https://github.com/ExodusMovement/exodus-hydra/issues/189)) ([615b6bb](https://github.com/ExodusMovement/exodus-hydra/commit/615b6bbd7a5b50d5b4538b32312a5a3822269328))

# [2.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@2.0.0...@exodus/atoms@2.1.0) (2022-08-18)

### Features

- add observe method to storage atom ([#172](https://github.com/ExodusMovement/exodus-hydra/issues/172)) ([ab9ecb3](https://github.com/ExodusMovement/exodus-hydra/commit/ab9ecb39e4819388b9e7e0a4ce2201eae0a5f0e0))
- storageAtom.set call delete with undefined ([#176](https://github.com/ExodusMovement/exodus-hydra/issues/176)) ([e03b734](https://github.com/ExodusMovement/exodus-hydra/commit/e03b7340714a2e2d27fc88c8090f40498cdf3fd8))

## [2.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@2.0.0...@exodus/atoms@1.1.0) (2022-08-11)

### Features

- make atom compatible with latest remote config ([9555139](https://github.com/ExodusMovement/exodus-hydra/commit/95551359aa5dcce7854cc3d4e276e4245fa86a7c))

## [1.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/atoms@1.0.0...@exodus/atoms@1.1.0) (2022-08-05)

### Features

- **atom:** localConfig atom factory ([#142](https://github.com/ExodusMovement/exodus-hydra/issues/142)) ([0606278](https://github.com/ExodusMovement/exodus-hydra/commit/060627878bb45cb4acbfb17191b205e391e439c0))
