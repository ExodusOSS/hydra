# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [12.9.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@12.8.1...@exodus/address-provider@12.9.0) (2025-02-27)

### Features

- feat: update @exodus/errors for latest SafeError (#11608)

## [12.8.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@12.8.0...@exodus/address-provider@12.8.1) (2025-02-24)

### Bug Fixes

- fix: lightningnetwork address in report (#11593)

## [12.8.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@12.7.1...@exodus/address-provider@12.8.0) (2025-02-24)

### Features

- feat: getEncodedPublicKey, for address-provider report (#11574)

## [12.7.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@12.7.0...@exodus/address-provider@12.7.1) (2025-02-21)

### Bug Fixes

- fix: skip exporting most reports if wallet doesn't exist (#11553)

## [12.7.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@12.6.4...@exodus/address-provider@12.7.0) (2025-02-19)

### Features

- feat(headless): type debug apis (#11235)

- feat: use multisig cosigner assetPublicKeys (#11402)

## [12.6.4](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@12.6.2...@exodus/address-provider@12.6.4) (2025-01-09)

### Bug Fixes

- fix: prefer WalletAccount.isInstance to instanceof (#10707)

### License

- license: re-license under MIT license (#10580)

## [12.6.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@12.6.2...@exodus/address-provider@12.6.3) (2024-11-25)

### License

- license: re-license under MIT license (#10580)

## [12.6.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@12.6.1...@exodus/address-provider@12.6.2) (2024-11-18)

### Bug Fixes

- fix: disable address caching by default for receive addresses (#10471)

## [12.6.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@12.6.0...@exodus/address-provider@12.6.1) (2024-11-10)

### Bug Fixes

- **address-provider:** include address-cache ([#10386](https://github.com/ExodusMovement/exodus-hydra/issues/10386)) ([5718e3c](https://github.com/ExodusMovement/exodus-hydra/commit/5718e3cb9fceed12ccb7fe8ff8de85518358b17d))
- provide walletAccount when calling getDefaultPathIndexes ([#10347](https://github.com/ExodusMovement/exodus-hydra/issues/10347)) ([d4407c5](https://github.com/ExodusMovement/exodus-hydra/commit/d4407c5e4d9ff34cc8beb762b25ad9e7c00a0baa))

## [12.6.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@12.5.2...@exodus/address-provider@12.6.0) (2024-10-30)

### Features

- **address-provider:** allow disabling address cache via config ([#10061](https://github.com/ExodusMovement/exodus-hydra/issues/10061)) ([fa24882](https://github.com/ExodusMovement/exodus-hydra/commit/fa2488258ff712d6f7f51b5c0691e46be8558fae))

## [12.5.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@12.5.1...@exodus/address-provider@12.5.2) (2024-10-09)

### Bug Fixes

- **address-provider:** export missing type ([#9510](https://github.com/ExodusMovement/exodus-hydra/issues/9510)) ([4011790](https://github.com/ExodusMovement/exodus-hydra/commit/401179083851a3f977071ff35ac093cbcbb0762b))

## [12.5.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@12.5.0...@exodus/address-provider@12.5.1) (2024-10-03)

**Note:** Version bump only for package @exodus/address-provider

## [12.5.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@12.4.0...@exodus/address-provider@12.5.0) (2024-10-03)

### Features

- update bip32 to 3.3.0 ([#9721](https://github.com/ExodusMovement/exodus-hydra/issues/9721)) ([eb08369](https://github.com/ExodusMovement/exodus-hydra/commit/eb08369df93ed7239cb106e095b143da0032e174))

## [12.3.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@12.3.0...@exodus/address-provider@12.3.1) (2024-10-01)

### Features

- use internal xpub for multisig hardware wallet policy ([#9639](https://github.com/ExodusMovement/exodus-hydra/issues/9639)) ([e96bee0](https://github.com/ExodusMovement/exodus-hydra/commit/e96bee045b3799a43464db4487d42a980ef95f0f))

## [12.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@12.2.2...@exodus/address-provider@12.3.0) (2024-09-24)

### Features

- allow returning highest unused indexes ([#9498](https://github.com/ExodusMovement/exodus-hydra/issues/9498)) ([df90160](https://github.com/ExodusMovement/exodus-hydra/commit/df90160623e62d1118ed11b887173966d8924350))

## [12.2.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@12.2.1...@exodus/address-provider@12.2.2) (2024-09-13)

### Bug Fixes

- **address-provider:** derive dummy pubkey for multisig ([#9220](https://github.com/ExodusMovement/exodus-hydra/issues/9220)) ([3fe30d4](https://github.com/ExodusMovement/exodus-hydra/commit/3fe30d40d05d17a4084ca5acd37632be4fed46cd))

## [12.2.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@12.2.0...@exodus/address-provider@12.2.1) (2024-09-04)

### Bug Fixes

- mock addresses should also return path in meta ([#8861](https://github.com/ExodusMovement/exodus-hydra/issues/8861)) ([9642e21](https://github.com/ExodusMovement/exodus-hydra/commit/9642e21c2835541cdfbb737431310c6716f43a14))

## [12.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@12.1.2...@exodus/address-provider@12.2.0) (2024-08-21)

### Features

- switch address-provider to valid esm (but not tests yet) ([#8604](https://github.com/ExodusMovement/exodus-hydra/issues/8604)) ([3c576e8](https://github.com/ExodusMovement/exodus-hydra/commit/3c576e82b2a6fab588c8e72fd4727138729225bc))

### Bug Fixes

- unpin exodus/bitcoin-lib ([#8346](https://github.com/ExodusMovement/exodus-hydra/issues/8346)) ([9250a42](https://github.com/ExodusMovement/exodus-hydra/commit/9250a421a6e8018674d7549486be677fffb36a4f))

## [12.1.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@12.1.1...@exodus/address-provider@12.1.2) (2024-08-07)

### Bug Fixes

- add multisigAtom to mock address provider deps ([#8260](https://github.com/ExodusMovement/exodus-hydra/issues/8260)) ([d22598c](https://github.com/ExodusMovement/exodus-hydra/commit/d22598c8af7da39c1073cdc3ed12cd0fb897d4b5))

## [12.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@12.1.0...@exodus/address-provider@12.1.1) (2024-07-31)

### Bug Fixes

- **address-provider:** remove unused dependency ([#8151](https://github.com/ExodusMovement/exodus-hydra/issues/8151)) ([d791275](https://github.com/ExodusMovement/exodus-hydra/commit/d791275b51c334a87081bb7a1a93cb6cf55a6c2f))

## [12.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@12.0.1...@exodus/address-provider@12.1.0) (2024-07-30)

### Features

- add xpub to report ([#8110](https://github.com/ExodusMovement/exodus-hydra/issues/8110)) ([3236c9b](https://github.com/ExodusMovement/exodus-hydra/commit/3236c9b8eed3c5d96c5679495d168f611f3bf881))

## [12.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@12.0.0...@exodus/address-provider@12.0.1) (2024-07-25)

### Bug Fixes

- migrate definitions ([#8030](https://github.com/ExodusMovement/exodus-hydra/issues/8030)) ([d2dfde5](https://github.com/ExodusMovement/exodus-hydra/commit/d2dfde55dfa843eb52842f64b3aac3a6f9a59069))

## [12.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@11.3.1...@exodus/address-provider@12.0.0) (2024-07-18)

### ⚠ BREAKING CHANGES

- add default config value & make config optional [#7754](https://github.com/ExodusMovement/exodus-hydra/issues/7754)

## [11.3.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@11.3.0...@exodus/address-provider@11.3.1) (2024-07-18)

**Note:** Version bump only for package @exodus/address-provider

## [11.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@11.2.0...@exodus/address-provider@11.3.0) (2024-07-16)

### Features

- add full key identifier to address meta ([#7595](https://github.com/ExodusMovement/exodus-hydra/issues/7595)) ([ebb8456](https://github.com/ExodusMovement/exodus-hydra/commit/ebb84561f24030af723714a9cf29e4a82fedf6a1))

### Bug Fixes

- fall back to mocked address for default path params/purpose ([#7684](https://github.com/ExodusMovement/exodus-hydra/issues/7684)) ([e3a00bd](https://github.com/ExodusMovement/exodus-hydra/commit/e3a00bdd38464b75c563f8ad36d260384362e816))
- use key identifier with enumerable derivation path ([#7854](https://github.com/ExodusMovement/exodus-hydra/issues/7854)) ([afd9653](https://github.com/ExodusMovement/exodus-hydra/commit/afd96533198a870568a83c4ecf03ead17d7797c1))

## [11.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@11.1.0...@exodus/address-provider@11.2.0) (2024-07-08)

### Features

- support importing addressProvider report into mock addressProvider ([#7596](https://github.com/ExodusMovement/exodus-hydra/issues/7596)) ([31a6d46](https://github.com/ExodusMovement/exodus-hydra/commit/31a6d46d2d941fe274eafa0ccba2c3c9bbcc838c))

## [11.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@11.1.0...@exodus/address-provider@11.2.0) (2024-07-08)

### Features

- support importing addressProvider report into mock addressProvider ([#7596](https://github.com/ExodusMovement/exodus-hydra/issues/7596)) ([31a6d46](https://github.com/ExodusMovement/exodus-hydra/commit/31a6d46d2d941fe274eafa0ccba2c3c9bbcc838c))

## [11.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@11.0.1...@exodus/address-provider@11.1.0) (2024-06-12)

### Features

- add option to specify purpose and address index when mocking ([#7325](https://github.com/ExodusMovement/exodus-hydra/issues/7325)) ([1810a61](https://github.com/ExodusMovement/exodus-hydra/commit/1810a61bf29b7c24a2eb375bce7762cd803afdaf))

## [11.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@11.0.0...@exodus/address-provider@11.0.1) (2024-06-06)

### Bug Fixes

- don't cache accountName for abstract accounts assets for now ([#7291](https://github.com/ExodusMovement/exodus-hydra/issues/7291)) ([fe7c9c1](https://github.com/ExodusMovement/exodus-hydra/commit/fe7c9c1c657f537cbd7d4d46276d67c22f8cf111))

## [11.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@10.5.0...@exodus/address-provider@11.0.0) (2024-06-04)

### ⚠ BREAKING CHANGES

- **address-provider:** throw + filter out unsupported asset sources (#6775)

### Features

- add xverse49NotMerged compat mode ([#7150](https://github.com/ExodusMovement/exodus-hydra/issues/7150)) ([af463fd](https://github.com/ExodusMovement/exodus-hydra/commit/af463fdfe844f60b5f9a7c0f89371df9d96c792f))
- addressProvider.getDefaultPurpose ([#6910](https://github.com/ExodusMovement/exodus-hydra/issues/6910)) ([533a105](https://github.com/ExodusMovement/exodus-hydra/commit/533a105af69fabb690e2c0c5fd4b3a21a2500526))

### Bug Fixes

- **address-provider:** return account name for eosio & hedera ([#7033](https://github.com/ExodusMovement/exodus-hydra/issues/7033)) ([1340232](https://github.com/ExodusMovement/exodus-hydra/commit/1340232cf140cb69a12cf8dc8250583ee9b9d9fa))
- **address-provider:** throw + filter out unsupported asset sources ([#6775](https://github.com/ExodusMovement/exodus-hydra/issues/6775)) ([644f88e](https://github.com/ExodusMovement/exodus-hydra/commit/644f88e34909c24816c26d3a4a3c6c8c38f71017))
- don't cache accountName until it's known ([#7265](https://github.com/ExodusMovement/exodus-hydra/issues/7265)) ([4b5823e](https://github.com/ExodusMovement/exodus-hydra/commit/4b5823e69ab5ca0195be1e500484893c7e485093))
- remove 44 from supported purposes for trezor if segwit is supported ([#7114](https://github.com/ExodusMovement/exodus-hydra/issues/7114)) ([12a7e06](https://github.com/ExodusMovement/exodus-hydra/commit/12a7e06cb4f696041ff6b508172a9a400007f7c9))

## [10.5.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@10.4.1...@exodus/address-provider@10.5.0) (2024-05-07)

### Features

- add multisig address provider ([#6707](https://github.com/ExodusMovement/exodus-hydra/issues/6707)) ([193685e](https://github.com/ExodusMovement/exodus-hydra/commit/193685eb29709c343b499806781aa2f29f70bd15))

## [10.4.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@10.4.0...@exodus/address-provider@10.4.1) (2024-05-06)

### Bug Fixes

- skip custodial walletAccounts in address-provider report ([#6764](https://github.com/ExodusMovement/exodus-hydra/issues/6764)) ([890646c](https://github.com/ExodusMovement/exodus-hydra/commit/890646cd77d333d7d4c86b4525b04282564b8cd3))

## [10.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@10.3.0...@exodus/address-provider@10.4.0) (2024-04-30)

### Features

- export 'chain' state in address-provider report ([#6340](https://github.com/ExodusMovement/exodus-hydra/issues/6340)) ([7fb3b96](https://github.com/ExodusMovement/exodus-hydra/commit/7fb3b965f6480e159c7b167ab9a49f8ee55480f1))

## [10.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@10.2.0...@exodus/address-provider@10.3.0) (2024-04-30)

### Features

- export addresses for all supported purposes ([#6339](https://github.com/ExodusMovement/exodus-hydra/issues/6339)) ([642058e](https://github.com/ExodusMovement/exodus-hydra/commit/642058e4f4c64f609249c093e6e475bfe12e3d8a))

### Bug Fixes

- pass `walletAccount` as string ([#6753](https://github.com/ExodusMovement/exodus-hydra/issues/6753)) ([c529845](https://github.com/ExodusMovement/exodus-hydra/commit/c5298456bc59dea3ea90f38fcf793e883440a103))

## [10.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@10.1.0...@exodus/address-provider@10.2.0) (2024-04-26)

### Features

- add wallet accounts & address provider api types ([#6593](https://github.com/ExodusMovement/exodus-hydra/issues/6593)) ([16c2c95](https://github.com/ExodusMovement/exodus-hydra/commit/16c2c9513b8c5caa46570102d313df168b56586f))

### Bug Fixes

- fall back to noAccountYet for abstractAccounts assets ([#6569](https://github.com/ExodusMovement/exodus-hydra/issues/6569)) ([a65de25](https://github.com/ExodusMovement/exodus-hydra/commit/a65de255c2242a5d2926f663459c6ca7f717da5d))

## [10.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@10.0.1...@exodus/address-provider@10.1.0) (2024-04-04)

### Features

- expose isOwnAddress in api ([#6375](https://github.com/ExodusMovement/exodus-hydra/issues/6375)) ([ba1df56](https://github.com/ExodusMovement/exodus-hydra/commit/ba1df56515e1fd97352307d122fb6bff443be6e4))
- support hardened indices ([#6377](https://github.com/ExodusMovement/exodus-hydra/issues/6377)) ([5b66788](https://github.com/ExodusMovement/exodus-hydra/commit/5b66788ced008d33fa45dff895b1693c5079b590))
- validate parameters of all public methods ([#6376](https://github.com/ExodusMovement/exodus-hydra/issues/6376)) ([7b680a4](https://github.com/ExodusMovement/exodus-hydra/commit/7b680a486d51d245064ced78328653b41f7209e0))

### Bug Fixes

- clear address provider seed mock onClear ([#6323](https://github.com/ExodusMovement/exodus-hydra/issues/6323)) ([a5f46a3](https://github.com/ExodusMovement/exodus-hydra/commit/a5f46a35ef86f2a704d2d7abcfbecd593ed20ead))

## [10.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@10.0.0...@exodus/address-provider@10.0.1) (2024-03-08)

### Features

- allow clearing state of mocked addresses ([#6010](https://github.com/ExodusMovement/exodus-hydra/issues/6010)) ([feae19b](https://github.com/ExodusMovement/exodus-hydra/commit/feae19bd7a5c4a670096a6fa769b3675720b0d98))

## [10.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@9.2.0...@exodus/address-provider@10.0.0) (2024-02-19)

### ⚠ BREAKING CHANGES

- support addresses from multiple seeds (#5748)

### Features

- support addresses from multiple seeds ([#5748](https://github.com/ExodusMovement/exodus-hydra/issues/5748)) ([6e7f8e1](https://github.com/ExodusMovement/exodus-hydra/commit/6e7f8e15fb34d025366fe72c0eec08929f4cc81a))

## [9.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@9.1.0...@exodus/address-provider@9.2.0) (2024-01-25)

### Features

- remove wallet accounts dependency from wallet ([#5471](https://github.com/ExodusMovement/exodus-hydra/issues/5471)) ([65559fc](https://github.com/ExodusMovement/exodus-hydra/commit/65559fc7d2ab6b6f881db843a4af73644cb172b2))

### Bug Fixes

- missing dependencies ([#5322](https://github.com/ExodusMovement/exodus-hydra/issues/5322)) ([01efedc](https://github.com/ExodusMovement/exodus-hydra/commit/01efedc7508fb14925277fdcd388afb721ac3dd1))

## [9.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@9.0.1...@exodus/address-provider@9.1.0) (2023-12-22)

### Features

- **address-provider:** debug node ([#5126](https://github.com/ExodusMovement/exodus-hydra/issues/5126)) ([4ac0312](https://github.com/ExodusMovement/exodus-hydra/commit/4ac0312c7e5a3022a2b0be27f6621e26509fcf08))

### Bug Fixes

- pack missing `debug` folder ([#5166](https://github.com/ExodusMovement/exodus-hydra/issues/5166)) ([e5df4d1](https://github.com/ExodusMovement/exodus-hydra/commit/e5df4d1f872dd318bdedb3a7dc559d7809060913))

## [9.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@9.0.0...@exodus/address-provider@9.0.1) (2023-11-24)

### Bug Fixes

- configurable Ledger address provider ([#4877](https://github.com/ExodusMovement/exodus-hydra/issues/4877)) ([1579ce9](https://github.com/ExodusMovement/exodus-hydra/commit/1579ce91dab1a8aa1ccc03d63cfd369e82a28b75))

## [9.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@8.2.0...@exodus/address-provider@9.0.0) (2023-11-23)

### ⚠ BREAKING CHANGES

- rework hardware wallet support in address provider (#3541)

### Features

- add `isOwnAddress` ([#4792](https://github.com/ExodusMovement/exodus-hydra/issues/4792)) ([b6d673b](https://github.com/ExodusMovement/exodus-hydra/commit/b6d673b7188c5bdba2de1b5ae2f0318882246b11))
- rework hardware wallet support in address provider ([#3541](https://github.com/ExodusMovement/exodus-hydra/issues/3541)) ([d5a0055](https://github.com/ExodusMovement/exodus-hydra/commit/d5a0055066d34e3999935ca7bf090389fa6a518c))

## [8.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@8.1.4...@exodus/address-provider@8.2.0) (2023-11-20)

### Features

- addressProvider api improvements ([#4804](https://github.com/ExodusMovement/exodus-hydra/issues/4804)) ([4221e07](https://github.com/ExodusMovement/exodus-hydra/commit/4221e07e54955740ae352c69444d80a77741ed0b))

## [8.1.4](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@8.1.3...@exodus/address-provider@8.1.4) (2023-11-16)

### Bug Fixes

- **known-addresses:** remove subscription on stop ([#4782](https://github.com/ExodusMovement/exodus-hydra/issues/4782)) ([3335469](https://github.com/ExodusMovement/exodus-hydra/commit/3335469bc739db982d67fd354ca8a93179b40c89))

## [8.1.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@8.1.2...@exodus/address-provider@8.1.3) (2023-11-01)

### Bug Fixes

- add purpose and path meta to address on re-hydrate ([#4652](https://github.com/ExodusMovement/exodus-hydra/issues/4652)) ([654eb3a](https://github.com/ExodusMovement/exodus-hydra/commit/654eb3aaf9ef0a50fcebe14ce8dd0012fe13b059))
- createPath validation ([#4659](https://github.com/ExodusMovement/exodus-hydra/issues/4659)) ([51bc774](https://github.com/ExodusMovement/exodus-hydra/commit/51bc774b187a7e60410cb25edc0f51432dfa2be4))

## [8.1.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@8.1.1...@exodus/address-provider@8.1.2) (2023-10-27)

### Bug Fixes

- address provider to allow partial m/ paths ([#4615](https://github.com/ExodusMovement/exodus-hydra/issues/4615)) ([966a9ae](https://github.com/ExodusMovement/exodus-hydra/commit/966a9ae19b42d1111b163b3c854f89bb8bdda554))

## [8.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@8.1.0...@exodus/address-provider@8.1.1) (2023-10-27)

### Bug Fixes

- address provider missing src utils folder ([#4600](https://github.com/ExodusMovement/exodus-hydra/issues/4600)) ([bc931b5](https://github.com/ExodusMovement/exodus-hydra/commit/bc931b586dfc1f43e9e6a5301493f0b13a743f7c))

## [8.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@8.0.0...@exodus/address-provider@8.1.0) (2023-10-26)

### Features

- adding asset.api extensions for address provider ([#4576](https://github.com/ExodusMovement/exodus-hydra/issues/4576)) ([2a9c4ff](https://github.com/ExodusMovement/exodus-hydra/commit/2a9c4ff68c0f1dd72576805ffdc46ac2011ea482))

## [8.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@7.4.4...@exodus/address-provider@8.0.0) (2023-10-06)

### ⚠ BREAKING CHANGES

- `get{Receive,Change}Addresses` return type (#4351)

### Bug Fixes

- `get{Receive,Change}Addresses` return type ([#4351](https://github.com/ExodusMovement/exodus-hydra/issues/4351)) ([3dac3f6](https://github.com/ExodusMovement/exodus-hydra/commit/3dac3f6ed37a15616c3873c153e1b4478fcf08be))

## [7.4.4](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@7.4.3...@exodus/address-provider@7.4.4) (2023-09-25)

### Bug Fixes

- derive purpose from derivation-path of KeyID with compatibility mode ([#4193](https://github.com/ExodusMovement/exodus-hydra/issues/4193)) ([d985904](https://github.com/ExodusMovement/exodus-hydra/commit/d9859049b609ae27baa623b74f93cda8846eb91f))

## [7.4.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@7.4.2...@exodus/address-provider@7.4.3) (2023-09-22)

### Bug Fixes

- address provided typeforce multiAddressMode ([#4180](https://github.com/ExodusMovement/exodus-hydra/issues/4180)) ([4c483d6](https://github.com/ExodusMovement/exodus-hydra/commit/4c483d681f2b133b18c1630c9eab516138e43113))

## [7.4.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@7.4.1...@exodus/address-provider@7.4.2) (2023-09-16)

**Note:** Version bump only for package @exodus/address-provider

## [7.4.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@7.4.0...@exodus/address-provider@7.4.1) (2023-09-13)

**Note:** Version bump only for package @exodus/address-provider

## [7.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@7.3.0...@exodus/address-provider@7.4.0) (2023-09-13)

### Features

- return all receive addresses in multi-address mode ([#4011](https://github.com/ExodusMovement/exodus-hydra/issues/4011)) ([1a41567](https://github.com/ExodusMovement/exodus-hydra/commit/1a41567ac7cc8b1f8f17b33a8e4f2cf79411afa0))

## [7.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@7.2.0...@exodus/address-provider@7.3.0) (2023-09-12)

### Features

- respect multiAddressMode in getReceiveAddress/getChangeAddress ([#3861](https://github.com/ExodusMovement/exodus-hydra/issues/3861)) ([80b39e6](https://github.com/ExodusMovement/exodus-hydra/commit/80b39e69faca8f46c4c7ed0e9da47a3772a69764))

## [7.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@7.1.0...@exodus/address-provider@7.2.0) (2023-08-24)

### Features

- add asset sorting to address-provider report ([#3555](https://github.com/ExodusMovement/exodus-hydra/issues/3555)) ([40a33a2](https://github.com/ExodusMovement/exodus-hydra/commit/40a33a279da4e36632b4d4f87632e7b28e3af0ee))

## [7.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@7.0.0...@exodus/address-provider@7.1.0) (2023-08-22)

### Features

- add address-provider report ([#3511](https://github.com/ExodusMovement/exodus-hydra/issues/3511)) ([69caf06](https://github.com/ExodusMovement/exodus-hydra/commit/69caf062b561d4ce9195b358806078703dc538cf))

## [7.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@6.1.4...@exodus/address-provider@7.0.0) (2023-08-09)

### ⚠ BREAKING CHANGES

- deserialize address provider apis (#3265)

### Features

- deserialize address provider apis ([#3265](https://github.com/ExodusMovement/exodus-hydra/issues/3265)) ([db894e9](https://github.com/ExodusMovement/exodus-hydra/commit/db894e92c8f16ebd1278a56b353f1dc7a1c06b59))

## [6.1.4](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@6.1.3...@exodus/address-provider@6.1.4) (2023-08-03)

### Bug Fixes

- missing knownAddresses when creating mock seed provider ([#3137](https://github.com/ExodusMovement/exodus-hydra/issues/3137)) ([b6d4fd5](https://github.com/ExodusMovement/exodus-hydra/commit/b6d4fd581ec6948532422e90ef041184d0667793))

## [6.1.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@6.1.2...@exodus/address-provider@6.1.3) (2023-08-02)

### Bug Fixes

- address cache/provider returning pojo instead of Address instance ([#3103](https://github.com/ExodusMovement/exodus-hydra/issues/3103)) ([1aad3b1](https://github.com/ExodusMovement/exodus-hydra/commit/1aad3b178ff5955bf0d0d1151607dfaed6cb4904))

## [6.1.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@6.1.1...@exodus/address-provider@6.1.2) (2023-07-18)

### Bug Fixes

- correctly pass asset to getTrezorMeta ([#2694](https://github.com/ExodusMovement/exodus-hydra/issues/2694)) ([72635bc](https://github.com/ExodusMovement/exodus-hydra/commit/72635bc10e4070394b16225287c5cb521d6d2634))

## [6.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@6.1.0...@exodus/address-provider@6.1.1) (2023-07-12)

### Bug Fixes

- **trezor:** derive unused address indexes from blockchain metadata ([#2531](https://github.com/ExodusMovement/exodus-hydra/issues/2531)) ([8b30637](https://github.com/ExodusMovement/exodus-hydra/commit/8b306375b0342cb2459f184531a1a7bb744226c0))

### Performance Improvements

- cache known addresses ([#2532](https://github.com/ExodusMovement/exodus-hydra/issues/2532)) ([fd736e3](https://github.com/ExodusMovement/exodus-hydra/commit/fd736e3fdef7938ca5caf99e8ca88d5456345fe4))

## [6.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@6.0.0...@exodus/address-provider@6.1.0) (2023-07-10)

### Features

- move address-provider to feature dir ([#2375](https://github.com/ExodusMovement/exodus-hydra/issues/2375)) ([e44ac1e](https://github.com/ExodusMovement/exodus-hydra/commit/e44ac1e80728151996313857510931182e5bc74a))
- validate supported trezor assets ([#2205](https://github.com/ExodusMovement/exodus-hydra/issues/2205)) ([ec40a7d](https://github.com/ExodusMovement/exodus-hydra/commit/ec40a7d5db13bd38d491da42be6e413b90c6a469))

## [6.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@5.0.2...@exodus/address-provider@6.0.0) (2023-07-06)

### ⚠ BREAKING CHANGES

- unify address cache apis (#2340)
- move in-memory address cache to address cache module (#2336)
- address provider getCachePath args, rename address cache modules (#2323)

### Features

- don't use in-memory cache in tests ([#2344](https://github.com/ExodusMovement/exodus-hydra/issues/2344)) ([48bf0e4](https://github.com/ExodusMovement/exodus-hydra/commit/48bf0e4edfc0fc36ae9a1ec76360f619c6e2f864))

### Code Refactoring

- address provider getCachePath args, rename address cache modules ([#2323](https://github.com/ExodusMovement/exodus-hydra/issues/2323)) ([b9dbb68](https://github.com/ExodusMovement/exodus-hydra/commit/b9dbb68e35f6cb8ec2b98335b888cc650e0f2e9d))
- move in-memory address cache to address cache module ([#2336](https://github.com/ExodusMovement/exodus-hydra/issues/2336)) ([d28a6c9](https://github.com/ExodusMovement/exodus-hydra/commit/d28a6c9843356d86262fb308cf40ecad023dc196))
- unify address cache apis ([#2340](https://github.com/ExodusMovement/exodus-hydra/issues/2340)) ([9cec592](https://github.com/ExodusMovement/exodus-hydra/commit/9cec5926345fd8742ca18ecfe917dec67c50c7a3))

## [5.0.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@5.0.1...@exodus/address-provider@5.0.2) (2023-07-06)

### Bug Fixes

- missing trezorKeyIdentifierProvider dependency ([#2325](https://github.com/ExodusMovement/exodus-hydra/issues/2325)) ([bec8e34](https://github.com/ExodusMovement/exodus-hydra/commit/bec8e341bb31f908281e748560a29d73ab4d2ec7))

## [5.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@5.0.0...@exodus/address-provider@5.0.1) (2023-07-05)

### Bug Fixes

- **address-provider:** add type to trezor key identifier provider ([#2309](https://github.com/ExodusMovement/exodus-hydra/issues/2309)) ([84912c4](https://github.com/ExodusMovement/exodus-hydra/commit/84912c48fc5734a6cc4273085548556e52c8fa1e))

## [5.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@4.2.0...@exodus/address-provider@5.0.0) (2023-07-05)

### ⚠ BREAKING CHANGES

- export feature definition from address-provider (#2155)

### Features

- `useCache` option in addressesProvider ([#2122](https://github.com/ExodusMovement/exodus-hydra/issues/2122)) ([7849973](https://github.com/ExodusMovement/exodus-hydra/commit/7849973a85086128370c208bdb8cf5b014366f5b))
- **address-provider:** move mock config atom and setter ([#2235](https://github.com/ExodusMovement/exodus-hydra/issues/2235)) ([b051025](https://github.com/ExodusMovement/exodus-hydra/commit/b0510256d557246589f939b64bec7e38b17ef779))
- export feature definition from address-provider ([#2155](https://github.com/ExodusMovement/exodus-hydra/issues/2155)) ([a4f8da3](https://github.com/ExodusMovement/exodus-hydra/commit/a4f8da39400bac23f3d84afdb56315b5a8a37567))

## [4.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@4.1.1...@exodus/address-provider@4.2.0) (2023-06-22)

### Features

- add Trezor `compatibilityMode` ([#1973](https://github.com/ExodusMovement/exodus-hydra/issues/1973)) ([d950eeb](https://github.com/ExodusMovement/exodus-hydra/commit/d950eeb14fec63f3385d69c2d605b6eea3645bd5))

### Bug Fixes

- use `walletAccount` index & rewrite purpose for cardano ([#1970](https://github.com/ExodusMovement/exodus-hydra/issues/1970)) ([d7edd68](https://github.com/ExodusMovement/exodus-hydra/commit/d7edd6807d063286ccd80917ac4244b0760e984b))

## [4.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@4.1.0...@exodus/address-provider@4.1.1) (2023-06-21)

### Performance Improvements

- don't await saving cache ([#1966](https://github.com/ExodusMovement/exodus-hydra/issues/1966)) ([d378c3c](https://github.com/ExodusMovement/exodus-hydra/commit/d378c3c9000cef791be646b08692b1e2ad60a74a))
- **trezor:** use `addressCache` ([#1880](https://github.com/ExodusMovement/exodus-hydra/issues/1880)) ([bd44603](https://github.com/ExodusMovement/exodus-hydra/commit/bd4460369286907b163b134b71fb1e0ae3d39ab5))

## [4.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/address-provider@4.0.0...@exodus/address-provider@4.1.0) (2023-06-12)

### Features

- **trezor:** harden #getAccounts ([#1900](https://github.com/ExodusMovement/exodus-hydra/issues/1900)) ([1b10cc3](https://github.com/ExodusMovement/exodus-hydra/commit/1b10cc3a15476cde81951c6d0c4b290cc58495ea))

## 4.0.0 (2023-06-09)

### ⚠ BREAKING CHANGES

- extract SeedAddressProvider (#1734)

### Features

- add trezor address provider ([#1776](https://github.com/ExodusMovement/exodus-hydra/issues/1776)) ([5c0e3ab](https://github.com/ExodusMovement/exodus-hydra/commit/5c0e3abee63ad28d24671d5b7320def51d1e7df6))

### Code Refactoring

- extract SeedAddressProvider ([#1734](https://github.com/ExodusMovement/exodus-hydra/issues/1734)) ([617a3a8](https://github.com/ExodusMovement/exodus-hydra/commit/617a3a8010147bdb8f6e3a9364488cf6d843b441))

## [3.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/addresses-provider@3.0.2...@exodus/addresses-provider@3.1.0) (2023-04-26)

### Features

- add extension point for hardware and custodial wallets ([#1299](https://github.com/ExodusMovement/exodus-hydra/issues/1299)) ([18abeee](https://github.com/ExodusMovement/exodus-hydra/commit/18abeeef8e90db83ad41afd68d28bcae76eb9422))

## [3.0.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/addresses-provider@3.0.2...@exodus/addresses-provider@3.0.3) (2023-04-25)

**Note:** Version bump only for package @exodus/addresses-provider

## [3.0.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/addresses-provider@3.0.1...@exodus/addresses-provider@3.0.2) (2023-04-04)

**Note:** Version bump only for package @exodus/addresses-provider

## [3.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/addresses-provider@3.0.0...@exodus/addresses-provider@3.0.1) (2023-01-17)

### Bug Fixes

- bitcoin default purpose in address provider ([#731](https://github.com/ExodusMovement/exodus-hydra/issues/731)) ([b4141d2](https://github.com/ExodusMovement/exodus-hydra/commit/b4141d26ec96407abe8cd207fcc7a73ad4bae27c))

## [3.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/addresses-provider@2.0.0...@exodus/addresses-provider@3.0.0) (2023-01-05)

### ⚠ BREAKING CHANGES

- **addresses-provider:** `getAddress` is no longer an arrow function, may need a `.bind()`

### Miscellaneous Chores

- **addresses-provider:** support mock addresses ([#587](https://github.com/ExodusMovement/exodus-hydra/issues/587)) ([fb835db](https://github.com/ExodusMovement/exodus-hydra/commit/fb835dbe986f5027040239abacbfce535588d0fd))

## [2.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/addresses-provider@1.2.0...@exodus/addresses-provider@2.0.0) (2022-11-22)

### ⚠ BREAKING CHANGES

- Only allow numbers for chainIndex and addressIndex (#505)

### Bug Fixes

- Only allow numbers for chainIndex and addressIndex ([#505](https://github.com/ExodusMovement/exodus-hydra/issues/505)) ([26d57ae](https://github.com/ExodusMovement/exodus-hydra/commit/26d57ae5e24b0e71b05bf5c8a332a8d982722541))

## [1.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/addresses-provider@1.1.0...@exodus/addresses-provider@1.2.0) (2022-11-21)

### Features

- address provider getUnusedAddressIndexes ([#476](https://github.com/ExodusMovement/exodus-hydra/issues/476)) ([4b347f9](https://github.com/ExodusMovement/exodus-hydra/commit/4b347f95f8de6c541a5c80c0fa5eeb1bcf71a15c))
- addressProvider.getSupportedPurposes ([#404](https://github.com/ExodusMovement/exodus-hydra/issues/404)) ([da6c0ca](https://github.com/ExodusMovement/exodus-hydra/commit/da6c0cad48df33c8d5a5a9b30444c41c89b7f446))

### Bug Fixes

- getAddressesInMultiAddressMode to include changeAddress, filter by chainIndex ([#487](https://github.com/ExodusMovement/exodus-hydra/issues/487)) ([cdf1bce](https://github.com/ExodusMovement/exodus-hydra/commit/cdf1bce08080d1f36cdff76fa2c31468eda4036d))
- getUnusedAddress to support change address indexes ([#432](https://github.com/ExodusMovement/exodus-hydra/issues/432)) ([1f9dd21](https://github.com/ExodusMovement/exodus-hydra/commit/1f9dd2164a78379332919b435292526420084869))

## [1.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/addresses-provider@1.0.0...@exodus/addresses-provider@1.1.0) (2022-10-25)

### Features

- **keychain:** rework privToPub mappers ([#181](https://github.com/ExodusMovement/exodus-hydra/issues/181)) ([0df08e6](https://github.com/ExodusMovement/exodus-hydra/commit/0df08e6fdd4c4790c019b40e4e6f95d2765e27e8))

### Bug Fixes

- pin 0.0.1 versions back in keychain ([#149](https://github.com/ExodusMovement/exodus-hydra/issues/149)) ([588f1ce](https://github.com/ExodusMovement/exodus-hydra/commit/588f1ce30c43eebe1134af4c20905f1af5d15b13))
