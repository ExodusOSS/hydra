# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.2.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/storage-memory@2.2.0...@exodus/storage-memory@2.2.1) (2024-09-26)

### Bug Fixes

- memory storage should wait till operation is done ([#9445](https://github.com/ExodusMovement/exodus-hydra/issues/9445)) ([0dee13c](https://github.com/ExodusMovement/exodus-hydra/commit/0dee13cbb91d2f2e2f8710ca1cec75729bda7965))

## [2.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/storage-memory@2.1.1...@exodus/storage-memory@2.2.0) (2024-08-20)

### Features

- make exodus/storage-memory a proper esm module ([#7599](https://github.com/ExodusMovement/exodus-hydra/issues/7599)) ([49b2cdc](https://github.com/ExodusMovement/exodus-hydra/commit/49b2cdcd0b4a24f448927ce2cb996146fef8611e))

## [2.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/storage-memory@2.1.0...@exodus/storage-memory@2.1.1) (2023-08-29)

### Bug Fixes

- pass params to namespaced in memory storage ([#3718](https://github.com/ExodusMovement/exodus-hydra/issues/3718)) ([181d4fe](https://github.com/ExodusMovement/exodus-hydra/commit/181d4feb4e7e6dfbd1e5b00363df3b4592f38898))

## [2.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/storage-memory@2.0.0...@exodus/storage-memory@2.1.0) (2023-05-08)

### Features

- opt-out for storage-memory serialization ([#1529](https://github.com/ExodusMovement/exodus-hydra/issues/1529)) ([230b03b](https://github.com/ExodusMovement/exodus-hydra/commit/230b03b5f8d58a727f7be3e0dd0d94bdf1b31142))

## [2.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/storage-memory@1.1.0...@exodus/storage-memory@2.0.0) (2023-05-05)

### ⚠ BREAKING CHANGES

- stringify/parse in memory storage (#1463)
- reject non-POJOs (#1476)

### Features

- reject non-POJOs ([#1476](https://github.com/ExodusMovement/exodus-hydra/issues/1476)) ([dea13ce](https://github.com/ExodusMovement/exodus-hydra/commit/dea13cea7cb8d8767ad588b6ef350587b02f592a))

### Code Refactoring

- stringify/parse in memory storage ([#1463](https://github.com/ExodusMovement/exodus-hydra/issues/1463)) ([516d5b2](https://github.com/ExodusMovement/exodus-hydra/commit/516d5b21f8b2eb02621a437b10c299978edef76d))

## 1.1.0 (2023-01-18)

### Features

- initial implementation ([1a12c3e](https://github.com/ExodusMovement/exodus-hydra/commit/1a12c3e5b0c5d25df16322c9b57b9adb6bad9a45))
- new batch methods; updated spec ([#1](https://github.com/ExodusMovement/exodus-hydra/issues/1)) ([5789bff](https://github.com/ExodusMovement/exodus-hydra/commit/5789bff5354c81442387c2f5162c68aa4292dce1))

### Bug Fixes

- **encrypted-storage:** halt namespaced reads until unlocked ([#739](https://github.com/ExodusMovement/exodus-hydra/issues/739)) ([44db50c](https://github.com/ExodusMovement/exodus-hydra/commit/44db50ca8ae55c700b83c6bafe34bf3289dbb70f))
- nest namespaces ([#2](https://github.com/ExodusMovement/exodus-hydra/issues/2)) ([2791e5d](https://github.com/ExodusMovement/exodus-hydra/commit/2791e5d9f8271ce860a384a3ff725b3846918ba5))

### Reverts

- Revert "Publish" ([7bfc339](https://github.com/ExodusMovement/exodus-hydra/commit/7bfc339f6229b11110e6936422b935b8820abd8a))
- Revert "Publish" ([da7967e](https://github.com/ExodusMovement/exodus-hydra/commit/da7967ebfef69853d932a5ec3d71a5d4eea391a2))
- Revert "Publish" ([7e8a72b](https://github.com/ExodusMovement/exodus-hydra/commit/7e8a72b77aad4f2b7590439db9556f31dec530a7))
