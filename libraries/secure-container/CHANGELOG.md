# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.2.1](https://github.com/ExodusMovement/exodus-hydra/compare/secure-container@3.2.0...secure-container@3.2.1) (2025-05-29)

**Note:** Version bump only for package secure-container

## [3.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/secure-container@3.0.0...secure-container@3.2.0) (2025-05-17)

### Features

- export main secure-container apis at index ([#12541](https://github.com/ExodusMovement/exodus-hydra/issues/12541)) ([9886897](https://github.com/ExodusMovement/exodus-hydra/commit/98868978959992b44342e04779cca39fdf0ff5a3))
- support blobKey/metadata in seco encryptCompressed ([#12307](https://github.com/ExodusMovement/exodus-hydra/issues/12307)) ([e6634ec](https://github.com/ExodusMovement/exodus-hydra/commit/e6634ec92cae36bb2824e0abf6106f807498bef9))

### Bug Fixes

- drop prepare script in secure-container ([#12295](https://github.com/ExodusMovement/exodus-hydra/issues/12295)) ([20ad7e0](https://github.com/ExodusMovement/exodus-hydra/commit/20ad7e0e4d9b59b6867d3b36cac39e3167603b87))

## [3.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/secure-container@3.0.0...secure-container@3.1.0) (2025-05-12)

### Features

- feat: support blobKey/metadata in seco encryptCompressed (#12307)

### Bug Fixes

- fix: drop prepare script in secure-container (#12295)

## [3.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/secure-container@2.0.0...secure-container@3.0.0) (2025-05-08)

### ⚠ BREAKING CHANGES

- declare secure-container exports and test them (#12244)
- make secure-container async (#12147)
- esm + lint autofix

### Features

- feat!: declare secure-container exports and test them (#12244)

- feat!: make secure-container async (#12147)

- feat(secure-container): add /compressed API (#12156)

- feat: use exodus/crypto for secure-container scrypt and gzip (#12213)

- feat: use exodus/crypto/aes for secure-container (#12153)

### Bug Fixes

- fix: use proper ESM (#9732)

- refactor!: esm + lint autofix

## 2.0.0 / 2020-10-23

- Require Node 12+ ([#6](https://github.com/exodusmovement/secure-container/pull/6))
- Add user-friendly `encrypt`/`decrypt` methods ([#4](https://github.com/exodusmovement/secure-container/pull/4))
- Add browser/react native support ([#5](https://github.com/exodusmovement/secure-container/pull/5))

  1.0.0 / 2017-05-19

---

- Add docs
- Remove runtime type checks

  0.0.2 / 2016-05-29

---

- fix `files` field in `package`

  0.0.1 / 2016-05-29

---

- initial release
