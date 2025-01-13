# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.1.1](https://github.com/ExodusMovement/hydra/compare/@exodus/dependency-injection@3.1.0...@exodus/dependency-injection@3.1.1) (2024-11-01)

Re-licensed under MIT license.

## [3.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-injection@3.0.0...@exodus/dependency-injection@3.1.0) (2024-09-20)

### Features

- type dependency injection container ([#9398](https://github.com/ExodusMovement/exodus-hydra/issues/9398)) ([e347bfa](https://github.com/ExodusMovement/exodus-hydra/commit/e347bfaf210751fcfb62600f276402eb7fdce46d))

## [3.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-injection@2.3.2...@exodus/dependency-injection@3.0.0) (2024-07-26)

### ⚠ BREAKING CHANGES

- change visibility of IoC nodes to private by default (#8028)

### Features

- change visibility of IoC nodes to private by default ([#8028](https://github.com/ExodusMovement/exodus-hydra/issues/8028)) ([7e2cb4b](https://github.com/ExodusMovement/exodus-hydra/commit/7e2cb4bcd1a9cfcbd7fb731fde3119829ee39c7f))

## [2.3.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-injection@2.3.1...@exodus/dependency-injection@2.3.2) (2024-07-24)

### Bug Fixes

- don't validate privacy of nodes without namespace ([#8023](https://github.com/ExodusMovement/exodus-hydra/issues/8023)) ([12de093](https://github.com/ExodusMovement/exodus-hydra/commit/12de09328f4d417bc9ff13679307f7948e2e707f))

## [2.3.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-injection@2.3.0...@exodus/dependency-injection@2.3.1) (2024-07-08)

### Bug Fixes

- make IoC packages proper ESM ([#7676](https://github.com/ExodusMovement/exodus-hydra/issues/7676)) ([d3348be](https://github.com/ExodusMovement/exodus-hydra/commit/d3348bee9016860c5702af3df84d14440d6d0cf4))

### Reverts

- Revert "feat: support fallback for optional dependency" (#7470) ([72b2f3b](https://github.com/ExodusMovement/exodus-hydra/commit/72b2f3bb7a76ed0122a49d27ca923ed745cfdc6c)), closes [#7470](https://github.com/ExodusMovement/exodus-hydra/issues/7470) [#7408](https://github.com/ExodusMovement/exodus-hydra/issues/7408)

## [2.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-injection@2.2.0...@exodus/dependency-injection@2.3.0) (2024-06-19)

### Features

- support fallback for optional dependency ([#7408](https://github.com/ExodusMovement/exodus-hydra/issues/7408)) ([136abd9](https://github.com/ExodusMovement/exodus-hydra/commit/136abd945bf070eac67436c16853adac980aa20d))

## [2.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-injection@2.1.2...@exodus/dependency-injection@2.2.0) (2024-02-29)

### Features

- add `withType` and `wrapConstant` ([#5919](https://github.com/ExodusMovement/exodus-hydra/issues/5919)) ([c4dc6ff](https://github.com/ExodusMovement/exodus-hydra/commit/c4dc6ff5ca9cafb764f3d16688bd05a1c1e61a2c))

## [2.1.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-injection@2.1.1...@exodus/dependency-injection@2.1.2) (2024-02-23)

### Bug Fixes

- duplicate error messages ([#5825](https://github.com/ExodusMovement/exodus-hydra/issues/5825)) ([e93549d](https://github.com/ExodusMovement/exodus-hydra/commit/e93549dc0586717ec97cf025dd6f570f41de05b1))
- error message when requesting private dependency ([#5827](https://github.com/ExodusMovement/exodus-hydra/issues/5827)) ([fd02492](https://github.com/ExodusMovement/exodus-hydra/commit/fd02492a3931b1713f72ab53503bacb2249e92af))

## [2.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-injection@2.1.0...@exodus/dependency-injection@2.1.1) (2024-02-21)

### Bug Fixes

- misleading error messages from cascading error ([#5784](https://github.com/ExodusMovement/exodus-hydra/issues/5784)) ([901765d](https://github.com/ExodusMovement/exodus-hydra/commit/901765df8e92b037fa8cb045f206060dff309e97))

## [2.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-injection@2.0.1...@exodus/dependency-injection@2.1.0) (2023-12-13)

### Features

- ioc can access private deps ([#4984](https://github.com/ExodusMovement/exodus-hydra/issues/4984)) ([4121f28](https://github.com/ExodusMovement/exodus-hydra/commit/4121f28d6208b92683804e354f6d783aeaad1c91))
- private dependencies ([#4928](https://github.com/ExodusMovement/exodus-hydra/issues/4928)) ([af2c82e](https://github.com/ExodusMovement/exodus-hydra/commit/af2c82e9f93932ceb66a94619f8f951a4980bdde))

## [2.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-injection@2.0.0...@exodus/dependency-injection@2.0.1) (2023-07-11)

**Note:** Version bump only for package @exodus/dependency-injection

## [2.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-injection@1.5.0...@exodus/dependency-injection@2.0.0) (2023-06-06)

### ⚠ BREAKING CHANGES

- support optional dependencies (#1807)

### Features

- support optional dependencies ([#1807](https://github.com/ExodusMovement/exodus-hydra/issues/1807)) ([3d8793f](https://github.com/ExodusMovement/exodus-hydra/commit/3d8793f2ed6eaca3e2098e37b9b945085dd6d826))

## [1.5.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-injection@1.4.0...@exodus/dependency-injection@1.5.0) (2023-06-06)

### Features

- display all errors to user on resolve ([#1788](https://github.com/ExodusMovement/exodus-hydra/issues/1788)) ([a559b5d](https://github.com/ExodusMovement/exodus-hydra/commit/a559b5d2db33065c4cc3bdd592a224df8c889ada))

## [1.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-injection@1.3.0...@exodus/dependency-injection@1.4.0) (2023-06-01)

### Features

- allow replacing existing dependencies ([#1753](https://github.com/ExodusMovement/exodus-hydra/issues/1753)) ([df6060d](https://github.com/ExodusMovement/exodus-hydra/commit/df6060d09f67dac21f3994dee04223567c921d0a))

## [1.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-injection@1.2.1...@exodus/dependency-injection@1.3.0) (2023-03-28)

### Features

- provide parent id to resolve error ([#1012](https://github.com/ExodusMovement/exodus-hydra/issues/1012)) ([3f96a4f](https://github.com/ExodusMovement/exodus-hydra/commit/3f96a4f93834476571e9ebae907183a092e08985))

## [1.2.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-injection@1.2.0...@exodus/dependency-injection@1.2.1) (2022-12-23)

### Bug Fixes

- **dependency-injection:** dont instantate module more than once ([#651](https://github.com/ExodusMovement/exodus-hydra/issues/651)) ([35db4b2](https://github.com/ExodusMovement/exodus-hydra/commit/35db4b208db44158e092d3aef221aa38ec174947))

## [1.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/dependency-injection@1.1.0...@exodus/dependency-injection@1.2.0) (2022-12-21)

### Features

- support positional argument injection ([#636](https://github.com/ExodusMovement/exodus-hydra/issues/636)) ([a1e695d](https://github.com/ExodusMovement/exodus-hydra/commit/a1e695d6b105e13f3166467143ef2f591ce6f77b))

## 1.1.0 (2022-12-15)

### Features

- dependency-injection module ([#458](https://github.com/ExodusMovement/exodus-hydra/issues/458)) ([9d73c1c](https://github.com/ExodusMovement/exodus-hydra/commit/9d73c1ca3951161f65a1487f47aafdaec036cdb1))
- **dependency-injection:** add getByType method ([#611](https://github.com/ExodusMovement/exodus-hydra/issues/611)) ([acfb61c](https://github.com/ExodusMovement/exodus-hydra/commit/acfb61c263b6dc9af8f227db401e6c11de63d0ac))
- ExodusModule fields for dependency injection ([#474](https://github.com/ExodusMovement/exodus-hydra/issues/474)) ([a256e7f](https://github.com/ExodusMovement/exodus-hydra/commit/a256e7f3023cd19c7b050310e28a3180c5a6e862))
