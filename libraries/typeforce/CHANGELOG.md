# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.19.5](https://github.com/ExodusMovement/exodus/compare/@exodus/typeforce@1.19.4...@exodus/typeforce@1.19.5) (2026-10-13)

**Note:** Version bump only for package @exodus/typeforce

## [1.19.4](https://github.com/ExodusMovement/hydra/compare/@exodus/typeforce@1.19.3...@exodus/typeforce@1.19.4) (2026-07-16)

### ⚠ BREAKING CHANGES

- **eslint-config-exodus:** @exodus/eslint-config-exodus no longer enforces
  no-floating-promises or no-unnecessary-condition and no longer sets
  parserOptions.project. Consumers relying on these without oxlint
  --type-aware lose the coverage; adopt oxlint type-aware.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>

- chore: drop redundant local no-floating-promises disable

@exodus/eslint-config-exodus no longer enables no-floating-promises, so

### Features

- **eslint-config-exodus:** retire type-aware eslint rules, drop parserOptions.project ([#17273](https://github.com/ExodusMovement/hydra/issues/17273)) ([622ec93](https://github.com/ExodusMovement/hydra/commit/622ec935f14f0b7d54ee6f2b034995606383397c)), closes [#7693](https://github.com/ExodusMovement/hydra/issues/7693) [#17253](https://github.com/ExodusMovement/hydra/issues/17253)

### Bug Fixes

- **typeforce:** prevent polynomial ReDoS in getTypeName ([#17575](https://github.com/ExodusMovement/hydra/issues/17575)) ([c535ec7](https://github.com/ExodusMovement/hydra/commit/c535ec7026a2c92375aa4bbf1b15f26a60c5159a))

## [1.19.3](https://github.com/ExodusMovement/hydra/compare/@exodus/typeforce@1.19.2...@exodus/typeforce@1.19.3) (2026-05-29)

### Bug Fixes

- **storage-spec, typeforce:** match .d.ts shape to CJS runtime ([#16842](https://github.com/ExodusMovement/hydra/issues/16842)) ([6ced904](https://github.com/ExodusMovement/hydra/commit/6ced9044026cf3d5a78ce91e2195e0fd331c17f5))

## [1.19.2](https://github.com/ExodusMovement/hydra/compare/@exodus/typeforce@1.19.1...@exodus/typeforce@1.19.2) (2026-03-04)

### Refactor

- Convert source from JavaScript to TypeScript
- Source files moved to `src/`, compiled output in `lib/`
- Auto-generated `.d.ts` type declarations
- Added `exports` map with `async` and `nothrow` entry points

## [1.19.1](https://github.com/ExodusMovement/hydra/compare/@exodus/typeforce@1.19.0...@exodus/typeforce@1.19.1) (2024-11-01)

Re-licensed under MIT license.
