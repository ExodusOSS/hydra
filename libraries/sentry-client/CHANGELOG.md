# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [6.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/sentry-client@6.1.1...@exodus/sentry-client@6.2.0) (2025-10-14)

### Features

- feat: support capturing error context (#13933)

## [6.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/sentry-client@6.1.0...@exodus/sentry-client@6.1.1) (2025-10-06)

**Note:** Version bump only for package @exodus/sentry-client

## [6.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/sentry-client@6.0.1...@exodus/sentry-client@6.1.0) (2025-10-03)

### Features

- feat: migrate to envelope API (#13952)

## [6.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/sentry-client@6.0.0...@exodus/sentry-client@6.0.1) (2025-08-27)

**Note:** Version bump only for package @exodus/sentry-client

## [6.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/sentry-client@5.0.2...@exodus/sentry-client@6.0.0) (2025-06-20)

### ⚠ BREAKING CHANGES

- enable tracking in all envs (#12889)

### Features

- feat!: enable tracking in all envs (#12889)

## [5.0.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/sentry-client@5.0.1...@exodus/sentry-client@5.0.2) (2025-06-06)

### Bug Fixes

- fix: downgrade exodus/crypto dep of sentry-client (#12849)

## [5.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/sentry-client@5.0.0...@exodus/sentry-client@5.0.1) (2025-06-04)

**Note:** Version bump only for package @exodus/sentry-client

## [5.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/sentry-client@4.0.0...@exodus/sentry-client@5.0.0) (2025-06-02)

### ⚠ BREAKING CHANGES

- enforce error message obfuscation (#12696)

### Features

- feat!: enforce error message obfuscation (#12696)

- feat: use `SafeError` (#12721)

### Bug Fixes

- fix: update @exodus/errors (#12627)

## [4.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/sentry-client@3.2.1...@exodus/sentry-client@4.0.0) (2025-02-27)

### ⚠ BREAKING CHANGES

- use @exodus/errors native stack trace parsing (#10769)

### Features

- feat: update @exodus/errors for latest SafeError (#11608)

- refactor!: use @exodus/errors native stack trace parsing (#10769)

## [3.2.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/sentry-client@3.2.0...@exodus/sentry-client@3.2.1) (2025-01-02)

### Bug Fixes

- fix: use proper ESM (#9732)

## [3.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/sentry-client@3.1.0...@exodus/sentry-client@3.2.0) (2024-07-08)

### Features

- accept a default stack trace parser in the sentry-client constructor ([#7347](https://github.com/ExodusMovement/exodus-hydra/issues/7347)) ([f3971b6](https://github.com/ExodusMovement/exodus-hydra/commit/f3971b68a5216730a6d242c3b94555875e7f671a))

## [3.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/sentry-client@3.0.1...@exodus/sentry-client@3.1.0) (2024-06-07)

### Features

- dangerouslyCaptureError ([#7108](https://github.com/ExodusMovement/exodus-hydra/issues/7108)) ([0f7f828](https://github.com/ExodusMovement/exodus-hydra/commit/0f7f8289d500bbd177f107cbfee10c1fdae98a52))

## [3.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/sentry-client@3.0.0...@exodus/sentry-client@3.0.1) (2024-05-23)

### Bug Fixes

- skip 1 line by default ([#7089](https://github.com/ExodusMovement/exodus-hydra/issues/7089)) ([c6e0ce5](https://github.com/ExodusMovement/exodus-hydra/commit/c6e0ce587bb54de841a8886df5582f4630b6526c))

## [3.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/sentry-client@2.1.1...@exodus/sentry-client@3.0.0) (2024-05-22)

### ⚠ BREAKING CHANGES

- throw on unparseable stack (#7064)

### Bug Fixes

- throw on unparseable stack ([#7064](https://github.com/ExodusMovement/exodus-hydra/issues/7064)) ([d1ebd89](https://github.com/ExodusMovement/exodus-hydra/commit/d1ebd89a87ba4fb24fdcbd01d5da0c46bc1ec39f))

## [2.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/sentry-client@2.1.0...@exodus/sentry-client@2.1.1) (2024-05-22)

### Bug Fixes

- improve regex to avoid redos ([#7032](https://github.com/ExodusMovement/exodus-hydra/issues/7032)) ([6f5f6cc](https://github.com/ExodusMovement/exodus-hydra/commit/6f5f6ccff7329be0dc36cb8f9871e3bbf9115311))

## [2.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/sentry-client@2.0.0...@exodus/sentry-client@2.1.0) (2024-05-20)

### Features

- handle traces for hermes ([#7012](https://github.com/ExodusMovement/exodus-hydra/issues/7012)) ([32d8a7b](https://github.com/ExodusMovement/exodus-hydra/commit/32d8a7b104bb0304357eb8a1a83574b1a06ca91e))

## [2.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/sentry-client@1.0.0...@exodus/sentry-client@2.0.0) (2023-08-04)

### ⚠ BREAKING CHANGES

- don't send errors without stack frames (#3157)
- default to minified parser, don't skip stack frames (#3151)

### Features

- support custom tags and metadata in Sentry errors ([#3128](https://github.com/ExodusMovement/exodus-hydra/issues/3128)) ([7fb4cc8](https://github.com/ExodusMovement/exodus-hydra/commit/7fb4cc88a1110268e21f34b31769c469d0b1eb7c))
- update stack trace processing to match Sentry's expected format ([#3123](https://github.com/ExodusMovement/exodus-hydra/issues/3123)) ([64445cd](https://github.com/ExodusMovement/exodus-hydra/commit/64445cd9b768ebdaf667ea679f2edae22d2db32c))

### Bug Fixes

- don't send errors without stack frames ([#3157](https://github.com/ExodusMovement/exodus-hydra/issues/3157)) ([a11e105](https://github.com/ExodusMovement/exodus-hydra/commit/a11e10573d8005a52da6d454940a62f69cd16686))

### Code Refactoring

- default to minified parser, don't skip stack frames ([#3151](https://github.com/ExodusMovement/exodus-hydra/issues/3151)) ([fc322cf](https://github.com/ExodusMovement/exodus-hydra/commit/fc322cfb66eac4cea614bb6edd47049549e65fad))
