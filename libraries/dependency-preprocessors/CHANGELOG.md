# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [6.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-preprocessors@6.2.0...@exodus/dependency-preprocessors@6.3.0) (2024-10-03)

### Features

- use atoms v9 ([#9651](https://github.com/ExodusMovement/exodus-hydra/issues/9651)) ([524aa61](https://github.com/ExodusMovement/exodus-hydra/commit/524aa61f69c81e6ac00b2f94ea830688a105b3e4))

### Bug Fixes

- dont namespace error tracking module inside its own feature ([#9674](https://github.com/ExodusMovement/exodus-hydra/issues/9674)) ([a3972b5](https://github.com/ExodusMovement/exodus-hydra/commit/a3972b5f8c4340dcf88788540470c54c459956f5))

## [6.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-preprocessors@6.1.0...@exodus/dependency-preprocessors@6.2.0) (2024-09-25)

### Features

- type dependency injection container ([#9398](https://github.com/ExodusMovement/exodus-hydra/issues/9398)) ([e347bfa](https://github.com/ExodusMovement/exodus-hydra/commit/e347bfaf210751fcfb62600f276402eb7fdce46d))

### Bug Fixes

- **dependency-preprocessor:** avoid passing full ioc config to nodes ([#9483](https://github.com/ExodusMovement/exodus-hydra/issues/9483)) ([1f556d7](https://github.com/ExodusMovement/exodus-hydra/commit/1f556d7d3c2933376d30c9c4785beb3e8b0c9de2))

## [6.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-preprocessors@6.0.5...@exodus/dependency-preprocessors@6.1.0) (2024-09-17)

### Features

- **preprocessors:** avoid unnecessary storage atoms ([#8911](https://github.com/ExodusMovement/exodus-hydra/issues/8911)) ([45da6ce](https://github.com/ExodusMovement/exodus-hydra/commit/45da6ce3afeac30ee37218744f88e0dd23de5cca))

### Bug Fixes

- performance-monitor for RPC methods ([#9319](https://github.com/ExodusMovement/exodus-hydra/issues/9319)) ([f7f11de](https://github.com/ExodusMovement/exodus-hydra/commit/f7f11deee78ed0ce3ae2a665b939b02df3ad5eae))

## [6.0.5](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-preprocessors@6.0.4...@exodus/dependency-preprocessors@6.0.5) (2024-09-09)

### Bug Fixes

- required vs optional config ([#7987](https://github.com/ExodusMovement/exodus-hydra/issues/7987)) ([d9b5db1](https://github.com/ExodusMovement/exodus-hydra/commit/d9b5db1325d009a4970890f017736be04d086fe9))

## [6.0.4](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-preprocessors@6.0.3...@exodus/dependency-preprocessors@6.0.4) (2024-08-16)

**Note:** Version bump only for package @exodus/dependency-preprocessors

## [6.0.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-preprocessors@6.0.2...@exodus/dependency-preprocessors@6.0.3) (2024-08-08)

### Bug Fixes

- make dependency-preprocessors valid ESM ([#8284](https://github.com/ExodusMovement/exodus-hydra/issues/8284)) ([4d91d96](https://github.com/ExodusMovement/exodus-hydra/commit/4d91d96da9009f6edce13da019bf7c7168389711))

## [6.0.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-preprocessors@6.0.1...@exodus/dependency-preprocessors@6.0.2) (2024-07-22)

### Bug Fixes

- **dependency-preprocessors:** handle undefined value of if condition at optional preprocessor ([#7931](https://github.com/ExodusMovement/exodus-hydra/issues/7931)) ([e1b6c7b](https://github.com/ExodusMovement/exodus-hydra/commit/e1b6c7b43160acbfaaedb6f1e9d15efb94e83cb0))

## [6.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-preprocessors@6.0.0...@exodus/dependency-preprocessors@6.0.1) (2024-07-18)

**Note:** Version bump only for package @exodus/dependency-preprocessors

## [6.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-preprocessors@5.4.0...@exodus/dependency-preprocessors@6.0.0) (2024-07-16)

### ⚠ BREAKING CHANGES

- remove `writeableOutsideNamespace` (#7858)

### Features

- remove `writeableOutsideNamespace` ([#7858](https://github.com/ExodusMovement/exodus-hydra/issues/7858)) ([7e4825e](https://github.com/ExodusMovement/exodus-hydra/commit/7e4825e9bf8669b0d57ec7ab6788d43a4b8bcbb3))

## [5.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-preprocessors@5.3.1...@exodus/dependency-preprocessors@5.4.0) (2024-07-12)

### Features

- add errorTracking feature to sdk ([#7670](https://github.com/ExodusMovement/exodus-hydra/issues/7670)) ([34dbc5c](https://github.com/ExodusMovement/exodus-hydra/commit/34dbc5c1f0b94ef4213dfaec788790c475eb962c)), closes [#7708](https://github.com/ExodusMovement/exodus-hydra/issues/7708)
- **error-tracking:** adds errorTracking module + namespaced preprocessor ([#7603](https://github.com/ExodusMovement/exodus-hydra/issues/7603)) ([aa7f8d7](https://github.com/ExodusMovement/exodus-hydra/commit/aa7f8d75aad88f83495c963f7271331a87181467)), closes [#7708](https://github.com/ExodusMovement/exodus-hydra/issues/7708)

## [5.3.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-preprocessors@5.3.0...@exodus/dependency-preprocessors@5.3.1) (2024-07-08)

### Bug Fixes

- make IoC packages proper ESM ([#7676](https://github.com/ExodusMovement/exodus-hydra/issues/7676)) ([d3348be](https://github.com/ExodusMovement/exodus-hydra/commit/d3348bee9016860c5702af3df84d14440d6d0cf4))

## [5.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-preprocessors@5.2.0...@exodus/dependency-preprocessors@5.3.0) (2024-06-13)

### Features

- add identification to atoms [#7261](https://github.com/ExodusMovement/exodus-hydra/issues/7261) ([#7357](https://github.com/ExodusMovement/exodus-hydra/issues/7357)) ([02cb880](https://github.com/ExodusMovement/exodus-hydra/commit/02cb8807bbd2a9ff89165cc7424071d0f0453f7f))

## [5.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-preprocessors@5.1.0...@exodus/dependency-preprocessors@5.2.0) (2024-02-28)

### Features

- merge configs ([#5880](https://github.com/ExodusMovement/exodus-hydra/issues/5880)) ([6a5691f](https://github.com/ExodusMovement/exodus-hydra/commit/6a5691fb73cc91eafbde891f1c636aa17a9cb5af))

## [5.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-preprocessors@5.0.0...@exodus/dependency-preprocessors@5.1.0) (2024-01-08)

### Features

- optionality based on registered nodes ([#5153](https://github.com/ExodusMovement/exodus-hydra/issues/5153)) ([b3bc2a0](https://github.com/ExodusMovement/exodus-hydra/commit/b3bc2a052ee41979c4817f03edfd391ca54a1b39))

## [5.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-preprocessors@4.1.0...@exodus/dependency-preprocessors@5.0.0) (2023-12-20)

### ⚠ BREAKING CHANGES

- add order preprocessor (#5114)

### Features

- add order preprocessor ([#5114](https://github.com/ExodusMovement/exodus-hydra/issues/5114)) ([485372a](https://github.com/ExodusMovement/exodus-hydra/commit/485372a27541fcc4ee9f94915a8517856d259376))

## [4.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-preprocessors@4.0.0...@exodus/dependency-preprocessors@4.1.0) (2023-12-18)

### Features

- add debugger preprocessor ([#5071](https://github.com/ExodusMovement/exodus-hydra/issues/5071)) ([e8dcfcf](https://github.com/ExodusMovement/exodus-hydra/commit/e8dcfcfd7e44dd877c33a434c2fed7312c9fc4ea))

### Bug Fixes

- read-only preprocessor definition default ([#5100](https://github.com/ExodusMovement/exodus-hydra/issues/5100)) ([f23f1bb](https://github.com/ExodusMovement/exodus-hydra/commit/f23f1bb335d07a33aac81223d521989710dc1fc3))

## [4.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-preprocessors@3.1.1...@exodus/dependency-preprocessors@4.0.0) (2023-12-13)

### ⚠ BREAKING CHANGES

- readonly atoms outside namespace (#4965)

### Features

- add async flag to `onAboveThreshold` ([#3915](https://github.com/ExodusMovement/exodus-hydra/issues/3915)) ([70d304d](https://github.com/ExodusMovement/exodus-hydra/commit/70d304d27a84fbe17612c68773c29fc0affdb07c))
- readonly atoms outside namespace ([#4965](https://github.com/ExodusMovement/exodus-hydra/issues/4965)) ([d96cfb5](https://github.com/ExodusMovement/exodus-hydra/commit/d96cfb5e2a1bf45b7be0a885b3f2cbcab412f59e))

## [3.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-preprocessors@3.1.0...@exodus/dependency-preprocessors@3.1.1) (2023-08-30)

### Bug Fixes

- move devDeps to deps ([#3760](https://github.com/ExodusMovement/exodus-hydra/issues/3760)) ([9a79713](https://github.com/ExodusMovement/exodus-hydra/commit/9a797135cf71cc39ed3b65b28c495ab2f322cd90))

## [3.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-preprocessors@3.0.0...@exodus/dependency-preprocessors@3.1.0) (2023-08-30)

### Features

- performance monitor ([#3660](https://github.com/ExodusMovement/exodus-hydra/issues/3660)) ([70a612d](https://github.com/ExodusMovement/exodus-hydra/commit/70a612d1db72a5af9598abde972973f54ee6ddc4))
- use performance monitor ([#3674](https://github.com/ExodusMovement/exodus-hydra/issues/3674)) ([4c58281](https://github.com/ExodusMovement/exodus-hydra/commit/4c5828113888bb4f63e5da54910e357cc48067d5))

## [3.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-preprocessors@2.8.4...@exodus/dependency-preprocessors@3.0.0) (2023-08-25)

### ⚠ BREAKING CHANGES

- adapt config preprocessor to accept config on definition (#3618)

### Features

- adapt config preprocessor to accept config on definition ([#3618](https://github.com/ExodusMovement/exodus-hydra/issues/3618)) ([71a7689](https://github.com/ExodusMovement/exodus-hydra/commit/71a768982eae66c2eb89be0e2cf2517be4f945bf))

## [2.8.4](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-preprocessors@2.8.3...@exodus/dependency-preprocessors@2.8.4) (2023-07-21)

**Note:** Version bump only for package @exodus/dependency-preprocessors

## [2.8.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-preprocessors@2.8.2...@exodus/dependency-preprocessors@2.8.3) (2023-07-13)

### Bug Fixes

- optional atoms read only preprocessor ([#2573](https://github.com/ExodusMovement/exodus-hydra/issues/2573)) ([eb4b6cf](https://github.com/ExodusMovement/exodus-hydra/commit/eb4b6cffc62cb58dcb0d52e4a5e0e1a8edf22982))

## [2.8.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-preprocessors@2.8.1...@exodus/dependency-preprocessors@2.8.2) (2023-06-23)

### Bug Fixes

- avoid wrapping with `enforceObservableRules` again ([#2088](https://github.com/ExodusMovement/exodus-hydra/issues/2088)) ([7004c19](https://github.com/ExodusMovement/exodus-hydra/commit/7004c193968c445ea0e854f521fb6f4fc7f791e0))

## [2.8.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-preprocessors@2.8.0...@exodus/dependency-preprocessors@2.8.1) (2023-06-21)

### Bug Fixes

- dev-mode-atoms ([#1986](https://github.com/ExodusMovement/exodus-hydra/issues/1986)) ([7e94805](https://github.com/ExodusMovement/exodus-hydra/commit/7e948057c7340f56ef63b3098271a9bd5f07f80e))

## [2.8.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-preprocessors@2.7.1...@exodus/dependency-preprocessors@2.8.0) (2023-06-15)

### Features

- log atom id in dev mode enhancers ([#1947](https://github.com/ExodusMovement/exodus-hydra/issues/1947)) ([1057ee9](https://github.com/ExodusMovement/exodus-hydra/commit/1057ee91cac678e60df3640641b0c3030f6dbaf7))

## [2.7.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-preprocessors@2.7.0...@exodus/dependency-preprocessors@2.7.1) (2023-06-13)

### Bug Fixes

- atom-collection dev-mode-atoms handling ([#1930](https://github.com/ExodusMovement/exodus-hydra/issues/1930)) ([2e4c61f](https://github.com/ExodusMovement/exodus-hydra/commit/2e4c61f9e346038ae0045407859fd36a8079b287))

## [2.7.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-preprocessors@2.6.0...@exodus/dependency-preprocessors@2.7.0) (2023-06-12)

### Features

- devModeAtoms preprocessor ([#1891](https://github.com/ExodusMovement/exodus-hydra/issues/1891)) ([5bcd78b](https://github.com/ExodusMovement/exodus-hydra/commit/5bcd78ba6b66b15ba069334b0fab21722cb10512))

## [2.6.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-preprocessors@2.5.0...@exodus/dependency-preprocessors@2.6.0) (2023-06-06)

### Features

- **alias:** support optional dependencies ([#1809](https://github.com/ExodusMovement/exodus-hydra/issues/1809)) ([b87ab2c](https://github.com/ExodusMovement/exodus-hydra/commit/b87ab2ce74c6a387a3fb5254d8d1ec8e75c69ca6))
- **readOnlyAtoms:** support optional dependencies ([#1817](https://github.com/ExodusMovement/exodus-hydra/issues/1817)) ([e675cdd](https://github.com/ExodusMovement/exodus-hydra/commit/e675cddaac50c5947509b1ea8c1ea27db6554f92))

## [2.5.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-preprocessors@2.4.0...@exodus/dependency-preprocessors@2.5.0) (2023-05-30)

### Features

- add optional preprocessor ([#1735](https://github.com/ExodusMovement/exodus-hydra/issues/1735)) ([6a35a8b](https://github.com/ExodusMovement/exodus-hydra/commit/6a35a8b2e64fe0169dd5a752c8e226fa1a88992c))

## [2.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-preprocessors@2.3.0...@exodus/dependency-preprocessors@2.4.0) (2023-05-05)

### Features

- read only atom collections preprocessor ([#1535](https://github.com/ExodusMovement/exodus-hydra/issues/1535)) ([3aa0235](https://github.com/ExodusMovement/exodus-hydra/commit/3aa02357eaad3209390a7ffe7a9d59e4fc580aa6))

## [2.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-preprocessors@2.2.0...@exodus/dependency-preprocessors@2.3.0) (2023-05-04)

### Features

- add warn mode to `readOnlyAtoms` ([#1506](https://github.com/ExodusMovement/exodus-hydra/issues/1506)) ([4e4d5eb](https://github.com/ExodusMovement/exodus-hydra/commit/4e4d5eb8979aa53ff30cfdd7acf202d9b4850f08))

## [2.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-preprocessors@2.1.0...@exodus/dependency-preprocessors@2.2.0) (2023-05-03)

### Features

- add read-only atoms preprocessor ([#1464](https://github.com/ExodusMovement/exodus-hydra/issues/1464)) ([a96494e](https://github.com/ExodusMovement/exodus-hydra/commit/a96494e7c8917102108851ac18c501abc343aaf6))

## [2.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-preprocessors@2.0.2...@exodus/dependency-preprocessors@2.1.0) (2023-04-03)

### Features

- namespace-storage preprocessor ([#1108](https://github.com/ExodusMovement/exodus-hydra/issues/1108)) ([fb8c57b](https://github.com/ExodusMovement/exodus-hydra/commit/fb8c57bc9a68ef7108864a75bdca2a5420d177c5))

## [2.0.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-preprocessors@2.0.1...@exodus/dependency-preprocessors@2.0.2) (2023-03-16)

### Bug Fixes

- alias preprocessor for unaliased deps ([#981](https://github.com/ExodusMovement/exodus-hydra/issues/981)) ([836475e](https://github.com/ExodusMovement/exodus-hydra/commit/836475e420f111960d587350f1663cee0a9c0f82))

## [2.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-preprocessors@2.0.0...@exodus/dependency-preprocessors@2.0.1) (2023-03-12)

### Bug Fixes

- alias preprocessor fallback ([#964](https://github.com/ExodusMovement/exodus-hydra/issues/964)) ([c539104](https://github.com/ExodusMovement/exodus-hydra/commit/c539104c28e18a53efa4a651b442dbbcccc2dfd3))

## [2.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-preprocessors@1.1.0...@exodus/dependency-preprocessors@2.0.0) (2023-02-15)

### ⚠ BREAKING CHANGES

- preprocessors node input/output format, library exports (#885)

### Features

- alias dependency preprocessor ([#870](https://github.com/ExodusMovement/exodus-hydra/issues/870)) ([0156a82](https://github.com/ExodusMovement/exodus-hydra/commit/0156a82e491695d6d5e122957343afdaed21d912))

### Code Refactoring

- preprocessors node input/output format, library exports ([#885](https://github.com/ExodusMovement/exodus-hydra/issues/885)) ([8ef7dc6](https://github.com/ExodusMovement/exodus-hydra/commit/8ef7dc6ef9286d5ed4e859aacb4251f59bb80642))

## 1.1.0 (2023-01-24)

### Features

- init @exodus/dependency-preprocessors lib ([#768](https://github.com/ExodusMovement/exodus-hydra/issues/768)) ([a1eaf22](https://github.com/ExodusMovement/exodus-hydra/commit/a1eaf224dab16e84ca578b32ac694e9db9a314cb))
