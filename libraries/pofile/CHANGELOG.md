# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.4.0](https://github.com/ExodusMovement/exodus/compare/@exodus/pofile@3.3.3...@exodus/pofile@3.4.0) (2026-09-09)

### Features

- **pofile:** raw parse with fail-fast on wrapped strings and unknown markers ([#44049](https://github.com/ExodusMovement/exodus/issues/44049)) ([b2fc923](https://github.com/ExodusMovement/exodus/commit/b2fc9233a8e64c44ac5db71e958a3e0dde32dcb9))

## [3.3.3](https://github.com/ExodusMovement/exodus/compare/@exodus/pofile@3.3.2...@exodus/pofile@3.3.3) (2026-08-05)

### Bug Fixes

- **pofile:** spec-compliant .po serialization (msgctxt order + escaping) ([#42389](https://github.com/ExodusMovement/exodus/issues/42389)) ([799ae8a](https://github.com/ExodusMovement/exodus/commit/799ae8a7ddf2a1bdb6a9f6480e385acddbcc8741))

## [3.3.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/pofile@3.3.1...@exodus/pofile@3.3.2) (2026-06-05)

### Bug Fixes

- **pofile:** prevent tokenizer infinite loops on truncated input ([#16306](https://github.com/ExodusMovement/exodus-hydra/issues/16306)) ([7d8ea37](https://github.com/ExodusMovement/exodus-hydra/commit/7d8ea37bb071baf59cabd846d11075dd11cc0c65))
- **tests:** replace toThrowError with toThrow (removed in Jest 30) ([#16055](https://github.com/ExodusMovement/exodus-hydra/issues/16055)) ([0e482cc](https://github.com/ExodusMovement/exodus-hydra/commit/0e482cc4dceae501cbb58d4c640a0f1dbac839b6)), closes [#16008](https://github.com/ExodusMovement/exodus-hydra/issues/16008)

## [3.3.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/pofile@3.3.0...@exodus/pofile@3.3.1) (2025-03-07)

### Bug Fixes

- fix: update lokalize download script to use computed ids (#11622)

## [3.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/pofile@3.2.3...@exodus/pofile@3.3.0) (2025-02-17)

### Features

- feat: download lokalise tasks in PO file format (#11477)

## [3.2.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/pofile@3.2.2...@exodus/pofile@3.2.3) (2025-02-07)

### Bug Fixes

- fix: updates i18n packages from audit review (#11373)

## [3.2.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/pofile@3.2.1...@exodus/pofile@3.2.2) (2024-12-20)

### License

- license: re-license under MIT license (#10599)

## [3.2.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/pofile@3.2.0...@exodus/pofile@3.2.1) (2024-12-03)

### Bug Fixes

- fix: po-file improvements ([#10643](https://github.com/ExodusMovement/exodus-hydra/issues/10643)) [c225903](https://github.com/ExodusMovement/exodus-hydra/commit/c22590316aa47b1de5d6ea0e058b929570f2b6db)

## [3.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/pofile@3.1.1...@exodus/pofile@3.2.0) (2024-11-20)

### Features

- feat(i18n): add msgcontext to pofile (#10388)

## 3.1.1 (2024-10-29)

### Bug Fixes

- **pofile:** merge PO file entry respects placeholders correctly ([#10194](https://github.com/ExodusMovement/exodus-hydra/issues/10194)) ([5ffb49a](https://github.com/ExodusMovement/exodus-hydra/commit/5ffb49adf5890a932e7028ae63ae13eec2df469e))
