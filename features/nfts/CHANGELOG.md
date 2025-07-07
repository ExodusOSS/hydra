# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [9.6.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@9.6.0...@exodus/nfts@9.6.1) (2025-06-30)

### Bug Fixes

- fix(nfts): use full wallet account in forceUpdate (#13029)

## [9.6.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@9.5.1...@exodus/nfts@9.6.0) (2025-05-14)

### Features

- feat: make nfts proper ESM (#12439)

### Bug Fixes

- fix: make two monitors in nfts stop immediately (#12438)

## [9.5.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@9.5.0...@exodus/nfts@9.5.1) (2025-03-20)

### Performance

- perf(nfts): persist last fetch in storage, add config.networkIntervalMultipliers (#11679)

- perf: only fetch nfts for current wallet account (#11644)

## [9.5.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@9.4.2...@exodus/nfts@9.5.0) (2025-02-10)

### Features

- feat(nfts): forward `useBatchMonitor` from feature config (#10809)

### Bug Fixes

- fix: ensure network exists before calling getCollectionStats (#11378)

- fix: properly memoize (#10783)

## [9.4.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@9.4.1...@exodus/nfts@9.4.2) (2024-12-06)

### License

- license: re-license under MIT license (#10355)

## [9.4.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@9.4.0...@exodus/nfts@9.4.1) (2024-10-29)

### Bug Fixes

- use correct query param for compressed NFTs in batch monitor ([#10211](https://github.com/ExodusMovement/exodus-hydra/issues/10211)) ([d256d58](https://github.com/ExodusMovement/exodus-hydra/commit/d256d583f2d58764eeeab0e7c52c9f8d9e57d638))

## [9.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@9.3.8...@exodus/nfts@9.4.0) (2024-10-03)

### Features

- use atoms v9 ([#9651](https://github.com/ExodusMovement/exodus-hydra/issues/9651)) ([524aa61](https://github.com/ExodusMovement/exodus-hydra/commit/524aa61f69c81e6ac00b2f94ea830688a105b3e4))

### Performance Improvements

- reduce unnecessary nft config upsert on import ([#9681](https://github.com/ExodusMovement/exodus-hydra/issues/9681)) ([843b115](https://github.com/ExodusMovement/exodus-hydra/commit/843b115407accd65f38a6eeaab4da0cf2b234f71))

## [9.3.8](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@9.3.7...@exodus/nfts@9.3.8) (2024-09-23)

**Note:** Version bump only for package @exodus/nfts

## [9.3.7](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@9.3.6...@exodus/nfts@9.3.7) (2024-09-11)

### Bug Fixes

- **nfts:** do not consider spam nfts in has-nfts selectors ([#8999](https://github.com/ExodusMovement/exodus-hydra/issues/8999)) ([c0a57d2](https://github.com/ExodusMovement/exodus-hydra/commit/c0a57d2525cd5c48b33c9b9295d9e3d51e9fd1ba))

## [9.3.6](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@9.3.5...@exodus/nfts@9.3.6) (2024-09-09)

**Note:** Version bump only for package @exodus/nfts

## [9.3.5](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@9.3.4...@exodus/nfts@9.3.5) (2024-08-20)

### Bug Fixes

- refetch recent txs in batch monitor to check for updates ([#8306](https://github.com/ExodusMovement/exodus-hydra/issues/8306)) ([5840448](https://github.com/ExodusMovement/exodus-hydra/commit/5840448c2846cc5c7dce21d946263eeafad250da))

## [9.3.4](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@9.3.3...@exodus/nfts@9.3.4) (2024-08-16)

**Note:** Version bump only for package @exodus/nfts

## [9.3.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@9.3.2...@exodus/nfts@9.3.3) (2024-07-25)

### Bug Fixes

- migrate definitions ([#8030](https://github.com/ExodusMovement/exodus-hydra/issues/8030)) ([d2dfde5](https://github.com/ExodusMovement/exodus-hydra/commit/d2dfde55dfa843eb52842f64b3aac3a6f9a59069))

## [9.3.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@9.3.1...@exodus/nfts@9.3.2) (2024-07-18)

**Note:** Version bump only for package @exodus/nfts

## [9.3.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@9.3.0...@exodus/nfts@9.3.1) (2024-06-18)

**Note:** Version bump only for package @exodus/nfts

## [9.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@9.2.2...@exodus/nfts@9.3.0) (2024-05-21)

### Features

- fetch collection stats for base nfts ([#7036](https://github.com/ExodusMovement/exodus-hydra/issues/7036)) ([6038c56](https://github.com/ExodusMovement/exodus-hydra/commit/6038c5604c55d794dc1f4fe6a477bdd75673c1b6))

## [9.2.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@9.2.1...@exodus/nfts@9.2.2) (2024-05-16)

### Bug Fixes

- use util function when comparing addresses ([#6944](https://github.com/ExodusMovement/exodus-hydra/issues/6944)) ([4212101](https://github.com/ExodusMovement/exodus-hydra/commit/4212101bd47e29f306de1db71c764cef08b5426e))

## [9.2.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@9.2.0...@exodus/nfts@9.2.1) (2024-05-10)

### Bug Fixes

- ensure batch monitor sends empty array for no data ([#6882](https://github.com/ExodusMovement/exodus-hydra/issues/6882)) ([2b25a63](https://github.com/ExodusMovement/exodus-hydra/commit/2b25a6327a06cb7de315f7593209ca3725e079ed))

## [9.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@9.1.8...@exodus/nfts@9.2.0) (2024-05-06)

### Features

- **nfts:** support dataVersion property in batch monitor ([#6773](https://github.com/ExodusMovement/exodus-hydra/issues/6773)) ([6389cc5](https://github.com/ExodusMovement/exodus-hydra/commit/6389cc53532cdd77bcc83e1d4824f52c07c770ff))

## [9.1.8](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@9.1.7...@exodus/nfts@9.1.8) (2024-04-30)

### Bug Fixes

- publish utils file ([#6757](https://github.com/ExodusMovement/exodus-hydra/issues/6757)) ([bce45c7](https://github.com/ExodusMovement/exodus-hydra/commit/bce45c780f9cfebc858a5468d3f655c9500bf743))

## [9.1.7](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@9.1.6...@exodus/nfts@9.1.7) (2024-04-30)

### Bug Fixes

- add correct ownerAddress to nft txs in batch monitor ([#6752](https://github.com/ExodusMovement/exodus-hydra/issues/6752)) ([432f537](https://github.com/ExodusMovement/exodus-hydra/commit/432f53798c24a0fdff016a37c50b5871d4918fc1))

## [9.1.6](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@9.1.5...@exodus/nfts@9.1.6) (2024-04-25)

### Bug Fixes

- add t22 nfts fetch param ([#6669](https://github.com/ExodusMovement/exodus-hydra/issues/6669)) ([15c5c4e](https://github.com/ExodusMovement/exodus-hydra/commit/15c5c4eb8842be9c92be4f2b12af1072ecedbd10))

## [9.1.5](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@9.1.4...@exodus/nfts@9.1.5) (2024-04-22)

### Bug Fixes

- type issue when invoking force fetch ([#6605](https://github.com/ExodusMovement/exodus-hydra/issues/6605)) ([4bc4203](https://github.com/ExodusMovement/exodus-hydra/commit/4bc4203cf6efc0300aa1dba179192780715a2d13))

## [9.1.4](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@9.1.3...@exodus/nfts@9.1.4) (2024-04-22)

**Note:** Version bump only for package @exodus/nfts

## [9.1.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@9.1.2...@exodus/nfts@9.1.3) (2024-04-17)

### Bug Fixes

- update constants for base network ([#6549](https://github.com/ExodusMovement/exodus-hydra/issues/6549)) ([c6b92a7](https://github.com/ExodusMovement/exodus-hydra/commit/c6b92a751b464da8ae88a49e2cc1f87e5ddc6051))

## [9.1.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@9.1.1...@exodus/nfts@9.1.2) (2024-04-16)

### Bug Fixes

- batch monitor initial fetch state update ([#6514](https://github.com/ExodusMovement/exodus-hydra/issues/6514)) ([3bb0e54](https://github.com/ExodusMovement/exodus-hydra/commit/3bb0e548a813a98ee2f8c6d4b27f131f77da150a))

## [9.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@9.1.0...@exodus/nfts@9.1.1) (2024-04-12)

### Bug Fixes

- missing dependency in nfts lifecycle plugin ([#6489](https://github.com/ExodusMovement/exodus-hydra/issues/6489)) ([82e4327](https://github.com/ExodusMovement/exodus-hydra/commit/82e4327b489d3187906c4e7b0809d0b37da15915))

## [9.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@9.0.1...@exodus/nfts@9.1.0) (2024-04-12)

### Features

- add NFTs batch monitor ([#6452](https://github.com/ExodusMovement/exodus-hydra/issues/6452)) ([54b7e8c](https://github.com/ExodusMovement/exodus-hydra/commit/54b7e8cf4277d9363f962a1f81e07913e6ff0e0a))

## [9.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@9.0.0...@exodus/nfts@9.0.1) (2024-04-12)

### Bug Fixes

- stop nfts monitor on lock ([#6350](https://github.com/ExodusMovement/exodus-hydra/issues/6350)) ([1c40223](https://github.com/ExodusMovement/exodus-hydra/commit/1c40223a3a1210fba29bb636e53f61c9b58ce377))

## [9.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@8.0.6...@exodus/nfts@9.0.0) (2024-03-21)

### ⚠ BREAKING CHANGES

- update nfts feature with default config (#6140)

### Features

- update nfts feature with default config ([#6140](https://github.com/ExodusMovement/exodus-hydra/issues/6140)) ([9f9371d](https://github.com/ExodusMovement/exodus-hydra/commit/9f9371d9c0715f78e966fa12f7c93fb149d6f172))

## [8.0.6](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@8.0.5...@exodus/nfts@8.0.6) (2024-03-15)

### Performance Improvements

- dedupe nftCollectionStats atom events ([#6128](https://github.com/ExodusMovement/exodus-hydra/issues/6128)) ([6b14244](https://github.com/ExodusMovement/exodus-hydra/commit/6b14244865af58eb56759fcdd39f032f96fb7de8))

## [8.0.5](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@8.0.4...@exodus/nfts@8.0.5) (2024-03-12)

### Bug Fixes

- use isSoftware when filtering walletAccount ([#6074](https://github.com/ExodusMovement/exodus-hydra/issues/6074)) ([a96a27b](https://github.com/ExodusMovement/exodus-hydra/commit/a96a27b88f733bb50fb8d71daea8d2b2dfc78de8))

## [8.0.4](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@8.0.3...@exodus/nfts@8.0.4) (2024-03-11)

### Performance Improvements

- dynamic nft monitor interval based on presence of nfts/txs ([#6030](https://github.com/ExodusMovement/exodus-hydra/issues/6030)) ([e874a32](https://github.com/ExodusMovement/exodus-hydra/commit/e874a32091efcf45ee1e4e9287a024615545e0ba))

## [8.0.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@8.0.2...@exodus/nfts@8.0.3) (2024-03-08)

### Features

- support seed wallet accounts ([#6001](https://github.com/ExodusMovement/exodus-hydra/issues/6001)) ([b0d6bf3](https://github.com/ExodusMovement/exodus-hydra/commit/b0d6bf3bdbc9d0f19bc2501fd8e1973e5fddd713))

## [8.0.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@8.0.1...@exodus/nfts@8.0.2) (2024-03-05)

### Performance Improvements

- update nfts atoms only on value update ([#5977](https://github.com/ExodusMovement/exodus-hydra/issues/5977)) ([e2f98d6](https://github.com/ExodusMovement/exodus-hydra/commit/e2f98d6994136ed5834045f68f5df3fbd74f6800))

## [8.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@8.0.0...@exodus/nfts@8.0.1) (2024-03-04)

### Bug Fixes

- **nfts:** resolve race condition when marking imported nfts ([#5831](https://github.com/ExodusMovement/exodus-hydra/issues/5831)) ([21ed240](https://github.com/ExodusMovement/exodus-hydra/commit/21ed240c1de29e9dc056628d4fb11abf07b47b7b))

## [8.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@7.11.2...@exodus/nfts@8.0.0) (2024-01-17)

### ⚠ BREAKING CHANGES

- remove nfts cache (#5245)

### Features

- harden object creation in merge-updates ([#5433](https://github.com/ExodusMovement/exodus-hydra/issues/5433)) ([e03c425](https://github.com/ExodusMovement/exodus-hydra/commit/e03c4251a3b65502ed0f50d814bd96b80608406a))
- remove nfts cache ([#5245](https://github.com/ExodusMovement/exodus-hydra/issues/5245)) ([589590e](https://github.com/ExodusMovement/exodus-hydra/commit/589590eadab6b6ecb347c0e6c241b7c6b346f15d))

## [7.11.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@7.11.1...@exodus/nfts@7.11.2) (2024-01-16)

### Bug Fixes

- **nfts:** clear collection stats atom ([#5412](https://github.com/ExodusMovement/exodus-hydra/issues/5412)) ([53ce66f](https://github.com/ExodusMovement/exodus-hydra/commit/53ce66fe71d2abbf971d36e5cfd03711db5412de))
- **nfts:** rename hasNftsByNetwork selector to hasNftsByAssetName ([#5406](https://github.com/ExodusMovement/exodus-hydra/issues/5406)) ([b25aba5](https://github.com/ExodusMovement/exodus-hydra/commit/b25aba5d428b19c81f066a4265e4a6dac39a4a3f))

## [7.11.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@7.11.0...@exodus/nfts@7.11.1) (2024-01-15)

### Bug Fixes

- **nfts:** do not merge nfts/txs arrays when updating atom ([#5407](https://github.com/ExodusMovement/exodus-hydra/issues/5407)) ([a267649](https://github.com/ExodusMovement/exodus-hydra/commit/a26764950c903c341e43060cc658ebd2b0cbbf25))

## [7.11.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@7.10.2...@exodus/nfts@7.11.0) (2024-01-12)

### Features

- **nfts:** create hasNftsByNetwork selector ([#5365](https://github.com/ExodusMovement/exodus-hydra/issues/5365)) ([b220de7](https://github.com/ExodusMovement/exodus-hydra/commit/b220de7a36d44ab1bc9ee34021889f8f36006d16))

### Bug Fixes

- revert "fix(nfts): monitor uses availableAssets" ([#5371](https://github.com/ExodusMovement/exodus-hydra/issues/5371)) ([30f552d](https://github.com/ExodusMovement/exodus-hydra/commit/30f552dd54a27e2fe9b7cc8ac84feb4c26b23531))

## [7.10.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@7.10.1...@exodus/nfts@7.10.2) (2024-01-12)

### Bug Fixes

- NFT enable Ledger support ([#5366](https://github.com/ExodusMovement/exodus-hydra/issues/5366)) ([9470a46](https://github.com/ExodusMovement/exodus-hydra/commit/9470a4683494dcfd55d89bfb6af3cb1c6407c5c5))

## [7.10.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@7.10.0...@exodus/nfts@7.10.1) (2024-01-12)

### Bug Fixes

- **nfts:** monitor uses availableAssets ([#5297](https://github.com/ExodusMovement/exodus-hydra/issues/5297)) ([383e51f](https://github.com/ExodusMovement/exodus-hydra/commit/383e51f5717217477e0dfd680d115152a2bdf62d))

## [7.10.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@7.9.0...@exodus/nfts@7.10.0) (2024-01-11)

### Features

- require default properties before flushing events ([#5342](https://github.com/ExodusMovement/exodus-hydra/issues/5342)) ([925d711](https://github.com/ExodusMovement/exodus-hydra/commit/925d71116130793ed8c26ecf2a6c46c23d726e25))

### Bug Fixes

- missing dependencies ([#5322](https://github.com/ExodusMovement/exodus-hydra/issues/5322)) ([01efedc](https://github.com/ExodusMovement/exodus-hydra/commit/01efedc7508fb14925277fdcd388afb721ac3dd1))

## [7.9.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@7.8.0...@exodus/nfts@7.9.0) (2024-01-10)

### Features

- **nfts:** mark nfts on import ([#5304](https://github.com/ExodusMovement/exodus-hydra/issues/5304)) ([ab5bbdc](https://github.com/ExodusMovement/exodus-hydra/commit/ab5bbdc6057cfdc49f51309bccdeb15c5b259bfa))

## [7.8.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@7.7.0...@exodus/nfts@7.8.0) (2024-01-08)

### Features

- **nfts:** analytics plugin ([#5286](https://github.com/ExodusMovement/exodus-hydra/issues/5286)) ([ce14d22](https://github.com/ExodusMovement/exodus-hydra/commit/ce14d22823f8ef312605a093d42923bbdb59f91d))
- **nfts:** expose and refactor has nfts atom ([#5243](https://github.com/ExodusMovement/exodus-hydra/issues/5243)) ([48287f1](https://github.com/ExodusMovement/exodus-hydra/commit/48287f1bedca70cebce1cbc0059adbedaff0fc1d))

## [7.7.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@7.6.0...@exodus/nfts@7.7.0) (2024-01-05)

### Features

- **nfts:** allow including spam nfts ([#5262](https://github.com/ExodusMovement/exodus-hydra/issues/5262)) ([a8f3cc0](https://github.com/ExodusMovement/exodus-hydra/commit/a8f3cc0a2f8112768abb14cca4d6c79c697426d3))

## [7.6.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@7.5.0...@exodus/nfts@7.6.0) (2024-01-04)

### Features

- nfts to provide nftsProxy to asset hook ([#5247](https://github.com/ExodusMovement/exodus-hydra/issues/5247)) ([2e41139](https://github.com/ExodusMovement/exodus-hydra/commit/2e4113989d724119a391b109ff96afbbee68a5b6))
- **nfts:** store nfts and txs in atoms ([#5227](https://github.com/ExodusMovement/exodus-hydra/issues/5227)) ([b94cf12](https://github.com/ExodusMovement/exodus-hydra/commit/b94cf12f2d980afa70f242b863964f0864a2b89e))

## [7.5.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@7.4.0...@exodus/nfts@7.5.0) (2024-01-01)

### Features

- nfts get selector to allow wallet account ([#5219](https://github.com/ExodusMovement/exodus-hydra/issues/5219)) ([9a3a3ac](https://github.com/ExodusMovement/exodus-hydra/commit/9a3a3ac1e0d112dd4c86295b8c309c1c925fcde8))
- **nfts:** enable evm collection stats ([#5210](https://github.com/ExodusMovement/exodus-hydra/issues/5210)) ([305ee02](https://github.com/ExodusMovement/exodus-hydra/commit/305ee02329b4a082507300e38adec9d04673234c))

## [7.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@7.2.0...@exodus/nfts@7.4.0) (2023-12-29)

### Features

- **nfts:** fetch collection stats ([#5188](https://github.com/ExodusMovement/exodus-hydra/issues/5188)) ([4b4fb69](https://github.com/ExodusMovement/exodus-hydra/commit/4b4fb6916bdeacdbafc056fa3d4f7ebfa2e1da77))
- **nfts:** prematurely tick monitors when interval changes ([#5208](https://github.com/ExodusMovement/exodus-hydra/issues/5208)) ([962c22b](https://github.com/ExodusMovement/exodus-hydra/commit/962c22bae3dc1b945482b87ea38ebff5c70b5c5b))

## [7.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@7.2.0...@exodus/nfts@7.3.0) (2023-12-27)

### Features

- **nfts:** fetch collection stats ([#5188](https://github.com/ExodusMovement/exodus-hydra/issues/5188)) ([4b4fb69](https://github.com/ExodusMovement/exodus-hydra/commit/4b4fb6916bdeacdbafc056fa3d4f7ebfa2e1da77))

## [7.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@7.1.4...@exodus/nfts@7.2.0) (2023-12-18)

### Features

- add optimistic nfts ([#5128](https://github.com/ExodusMovement/exodus-hydra/issues/5128)) ([6cfd5f9](https://github.com/ExodusMovement/exodus-hydra/commit/6cfd5f9e06e152977928869440408150378ba609))

## [7.1.4](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@7.1.3...@exodus/nfts@7.1.4) (2023-12-15)

### Bug Fixes

- **nfts:** prototype-related issues ([#5106](https://github.com/ExodusMovement/exodus-hydra/issues/5106)) ([d6359b3](https://github.com/ExodusMovement/exodus-hydra/commit/d6359b309e5f54206b77e5b57a15cdc0489373e7))

## [7.1.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@7.1.2...@exodus/nfts@7.1.3) (2023-12-15)

### Bug Fixes

- **nfts:** add createAssetSourceNftTxsById selector ([#5089](https://github.com/ExodusMovement/exodus-hydra/issues/5089)) ([339114d](https://github.com/ExodusMovement/exodus-hydra/commit/339114d90c5946f30d447b9e1a05ea8fa39c738a))

## [7.1.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@7.1.1...@exodus/nfts@7.1.2) (2023-11-28)

### Bug Fixes

- add compressedNfts fetch param to nfts monitor ([#4906](https://github.com/ExodusMovement/exodus-hydra/issues/4906)) ([dee39c9](https://github.com/ExodusMovement/exodus-hydra/commit/dee39c93dd393ddf0ae837e387fbf10bed380e17))

## [7.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@7.1.0...@exodus/nfts@7.1.1) (2023-11-20)

### Bug Fixes

- **nfts:** fetch nfts on txLog updates ([#4772](https://github.com/ExodusMovement/exodus-hydra/issues/4772)) ([ddc1582](https://github.com/ExodusMovement/exodus-hydra/commit/ddc1582c534c628b9814438dc746be8898412c52))

## [7.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@7.0.0...@exodus/nfts@7.1.0) (2023-11-03)

### Features

- allow fetching listed NFTs and verified status ([#4684](https://github.com/ExodusMovement/exodus-hydra/issues/4684)) ([0a31c86](https://github.com/ExodusMovement/exodus-hydra/commit/0a31c866568f07358638cc95901be760ec9aff06))

## [7.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@6.4.1...@exodus/nfts@7.0.0) (2023-11-02)

### ⚠ BREAKING CHANGES

- move auto-approve nfts from plugin to monitor (#4594)

### Bug Fixes

- move auto-approve nfts from plugin to monitor ([#4594](https://github.com/ExodusMovement/exodus-hydra/issues/4594)) ([779c5f0](https://github.com/ExodusMovement/exodus-hydra/commit/779c5f0940489d7cc6a7842712bce4bfb42841ed))

## [6.4.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@6.4.0...@exodus/nfts@6.4.1) (2023-10-18)

### Bug Fixes

- **nfts:** run autoApprove on restore to handle ordinals ([#4442](https://github.com/ExodusMovement/exodus-hydra/issues/4442)) ([0823f98](https://github.com/ExodusMovement/exodus-hydra/commit/0823f9805d92690a2191c077bca009b514ab15ed))

## [6.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@6.3.0...@exodus/nfts@6.4.0) (2023-10-18)

### Features

- **nfts:** add getCollectionStats, getNftImageUrl apis ([#4017](https://github.com/ExodusMovement/exodus-hydra/issues/4017)) ([7cf676d](https://github.com/ExodusMovement/exodus-hydra/commit/7cf676d28904d48db3b49f42eab06e3420066354))

## [6.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@6.2.0...@exodus/nfts@6.3.0) (2023-10-02)

### Features

- add nfts loaded selector ([#4279](https://github.com/ExodusMovement/exodus-hydra/issues/4279)) ([d1ea143](https://github.com/ExodusMovement/exodus-hydra/commit/d1ea143a8325d3661f14dbab767c77a3da2588b3))

## [6.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@6.1.0...@exodus/nfts@6.2.0) (2023-09-30)

### Features

- nfts selectors ([#4274](https://github.com/ExodusMovement/exodus-hydra/issues/4274)) ([b2a2129](https://github.com/ExodusMovement/exodus-hydra/commit/b2a2129e9f5b5b229533f0cf0e177be2b532e97e))

## [6.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@6.0.2...@exodus/nfts@6.1.0) (2023-09-12)

### Features

- add auto approve nfts on import plugin ([#3598](https://github.com/ExodusMovement/exodus-hydra/issues/3598)) ([c78c969](https://github.com/ExodusMovement/exodus-hydra/commit/c78c969d82caa72ae8472dd0b9e80e075c387b6e))

## [6.0.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@6.0.1...@exodus/nfts@6.0.2) (2023-09-11)

### Bug Fixes

- **nfts:** also filter out undefined tx from txList ([#3464](https://github.com/ExodusMovement/exodus-hydra/issues/3464)) ([62e9ccf](https://github.com/ExodusMovement/exodus-hydra/commit/62e9ccf61c2fc0982964c2e86fba958976d12f9e))

## [6.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@6.0.0...@exodus/nfts@6.0.1) (2023-09-08)

### Bug Fixes

- **nfts:** get selector ([#3929](https://github.com/ExodusMovement/exodus-hydra/issues/3929)) ([1bb1116](https://github.com/ExodusMovement/exodus-hydra/commit/1bb11167a6c261c11fa384f8a0c720e7a6dd4478))

## [6.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@5.2.0...@exodus/nfts@6.0.0) (2023-09-07)

### ⚠ BREAKING CHANGES

- nfts redux module (#3868)

### Features

- nfts redux module ([#3868](https://github.com/ExodusMovement/exodus-hydra/issues/3868)) ([7facf26](https://github.com/ExodusMovement/exodus-hydra/commit/7facf262253e24579bfc7ea29a0d38c3ed65e83d))

## [5.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@5.1.0...@exodus/nfts@5.2.0) (2023-08-31)

### Features

- **nfts:** add tezos support ([#3585](https://github.com/ExodusMovement/exodus-hydra/issues/3585)) ([562b0cb](https://github.com/ExodusMovement/exodus-hydra/commit/562b0cb999df048cb763962894ab2fc4ff0ec4dd))

## [5.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@5.0.3...@exodus/nfts@5.1.0) (2023-08-29)

### Features

- **nfts:** add atom observer ([#3687](https://github.com/ExodusMovement/exodus-hydra/issues/3687)) ([2d3972a](https://github.com/ExodusMovement/exodus-hydra/commit/2d3972a18b234d69a0781f3e5555253ea3b7aeb9))

### Bug Fixes

- add observing atoms to unlock if conditional ([#3726](https://github.com/ExodusMovement/exodus-hydra/issues/3726)) ([1112fc5](https://github.com/ExodusMovement/exodus-hydra/commit/1112fc5e1a6731d3d97b4e20541a96d4ba06a228))

## [5.0.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@5.0.2...@exodus/nfts@5.0.3) (2023-08-15)

### Bug Fixes

- **nfts:** resolve subsequent load when finished ([#3385](https://github.com/ExodusMovement/exodus-hydra/issues/3385)) ([da9c42e](https://github.com/ExodusMovement/exodus-hydra/commit/da9c42e3719467ea254f72c61055ea9819030b70))

## [5.0.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@5.0.1...@exodus/nfts@5.0.2) (2023-08-14)

### Bug Fixes

- **nfts:** monitors shouldn't return empty data if network requests fail ([#3159](https://github.com/ExodusMovement/exodus-hydra/issues/3159)) ([a512bbf](https://github.com/ExodusMovement/exodus-hydra/commit/a512bbf933d92d12d2a54342422868d88b3aabdf))
- stop ongoing operations in plugin ([#3252](https://github.com/ExodusMovement/exodus-hydra/issues/3252)) ([e9084e6](https://github.com/ExodusMovement/exodus-hydra/commit/e9084e6480bc86b521b5828a703b0919b2b7abc2))

## [5.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@5.0.0...@exodus/nfts@5.0.1) (2023-08-07)

### Bug Fixes

- **nfts:** pack client dir ([#3184](https://github.com/ExodusMovement/exodus-hydra/issues/3184)) ([9845dbe](https://github.com/ExodusMovement/exodus-hydra/commit/9845dbea3e9ca899bfa5c0a8672ec14c05dbb65b))

## [5.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@4.0.1...@exodus/nfts@5.0.0) (2023-08-01)

### ⚠ BREAKING CHANGES

- ship nfts with nfts proxy (#3062)

### Features

- ship nfts with nfts proxy ([#3062](https://github.com/ExodusMovement/exodus-hydra/issues/3062)) ([f32734d](https://github.com/ExodusMovement/exodus-hydra/commit/f32734decfaafff624cd0ee784473855b343bd9e))

## [4.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@4.0.0...@exodus/nfts@4.0.1) (2023-07-21)

### Performance Improvements

- use cache when retrieving addresses from nfts monitors ([#2809](https://github.com/ExodusMovement/exodus-hydra/issues/2809)) ([f575ba2](https://github.com/ExodusMovement/exodus-hydra/commit/f575ba2599d1583b84ec3c5513121f4fd7a6e8f4))

## [4.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@3.0.1...@exodus/nfts@4.0.0) (2023-07-21)

### Features

- nfts assets extensions ([#2702](https://github.com/ExodusMovement/exodus-hydra/issues/2702)) ([e3b5f30](https://github.com/ExodusMovement/exodus-hydra/commit/e3b5f30920f156aa92cc78e272b10f28e9cbc70c))
- **nfts:** has nfts atom ([#2781](https://github.com/ExodusMovement/exodus-hydra/issues/2781)) ([03dffd0](https://github.com/ExodusMovement/exodus-hydra/commit/03dffd0d5c1ee56a9dfe03d9bfff6451dcc3e4d1))

### Bug Fixes

- **nfts:** nfts use constant network mapping ([#2800](https://github.com/ExodusMovement/exodus-hydra/issues/2800)) ([4d3df0b](https://github.com/ExodusMovement/exodus-hydra/commit/4d3df0b0dbd1095e3ff563afc3c16aa4fe9e2acd))

## [3.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@3.0.0...@exodus/nfts@3.0.1) (2023-07-14)

**Note:** Version bump only for package @exodus/nfts

## [3.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@2.2.0...@exodus/nfts@3.0.0) (2023-07-14)

### ⚠ BREAKING CHANGES

- nfts feature out of headless (#2588)

### Features

- nfts feature out of headless ([#2588](https://github.com/ExodusMovement/exodus-hydra/issues/2588)) ([86ac6f5](https://github.com/ExodusMovement/exodus-hydra/commit/86ac6f516d7d39fbe5174c3d31ab82f5561b17aa))

## [2.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@2.1.3...@exodus/nfts@2.2.0) (2023-07-05)

### Features

- readable errors in warning overlay ([#2299](https://github.com/ExodusMovement/exodus-hydra/issues/2299)) ([31819f0](https://github.com/ExodusMovement/exodus-hydra/commit/31819f0d1573a212f31577fcbff51df01c656dfe))

## [2.1.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@2.1.2...@exodus/nfts@2.1.3) (2023-07-05)

### Bug Fixes

- warn and use logger in NftsDataNetworkMonitor ([#2297](https://github.com/ExodusMovement/exodus-hydra/issues/2297)) ([6d5dc86](https://github.com/ExodusMovement/exodus-hydra/commit/6d5dc867ad02646fc01f21a28c8a9f9d9dfe99d3))

## [2.1.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@2.1.1...@exodus/nfts@2.1.2) (2023-07-03)

### Bug Fixes

- **nfts:** filter non exodus wallet accounts ([#2220](https://github.com/ExodusMovement/exodus-hydra/issues/2220)) ([ac1a43b](https://github.com/ExodusMovement/exodus-hydra/commit/ac1a43b471005bd46558306d386004f185076124))

## [2.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@2.1.0...@exodus/nfts@2.1.1) (2023-06-21)

### Performance Improvements

- prevent writing same value to atoms ([#2078](https://github.com/ExodusMovement/exodus-hydra/issues/2078)) ([bd901b4](https://github.com/ExodusMovement/exodus-hydra/commit/bd901b40a10c8983f2fe6fbb10c9dc8a81ccbd60))

## [2.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@2.0.0...@exodus/nfts@2.1.0) (2023-06-21)

### Features

- **nfts:** add definition types ([#1967](https://github.com/ExodusMovement/exodus-hydra/issues/1967)) ([c593f8a](https://github.com/ExodusMovement/exodus-hydra/commit/c593f8aac4ef00e22846a09a505bed65ae080cf3))

### Performance Improvements

- dont set same value on observable again ([#2007](https://github.com/ExodusMovement/exodus-hydra/issues/2007)) ([3582c76](https://github.com/ExodusMovement/exodus-hydra/commit/3582c76fcfaebfc447c5ceb4d8be73ab28286047))

## [2.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@1.2.0...@exodus/nfts@2.0.0) (2023-06-09)

### ⚠ BREAKING CHANGES

- use address provider (#1790)

### Code Refactoring

- use address provider ([#1790](https://github.com/ExodusMovement/exodus-hydra/issues/1790)) ([11308cd](https://github.com/ExodusMovement/exodus-hydra/commit/11308cdb18b4d30886533589205c33b5408c1189))

## [1.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@1.1.2...@exodus/nfts@1.2.0) (2023-06-08)

### Features

- add missing module clear methods ([#1851](https://github.com/ExodusMovement/exodus-hydra/issues/1851)) ([041a097](https://github.com/ExodusMovement/exodus-hydra/commit/041a0974b65232d2aa7d6d4926b0736817e9aa59))

## [1.1.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@1.1.1...@exodus/nfts@1.1.2) (2023-06-07)

### Bug Fixes

- **nfts:** start promise deadlock ([#1828](https://github.com/ExodusMovement/exodus-hydra/issues/1828)) ([63b16f5](https://github.com/ExodusMovement/exodus-hydra/commit/63b16f5799ed76c54bf6c660c6dedbb6765b21b2))

## [1.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@1.1.0...@exodus/nfts@1.1.1) (2023-06-02)

### Bug Fixes

- **nfts:** awaitProcessed channel on load ([#1775](https://github.com/ExodusMovement/exodus-hydra/issues/1775)) ([d31e0f7](https://github.com/ExodusMovement/exodus-hydra/commit/d31e0f71402b71773731641c95b3c436d575653c))

## [1.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/nfts@1.0.0...@exodus/nfts@1.1.0) (2023-05-29)

### Features

- make interval configurable ([#1706](https://github.com/ExodusMovement/exodus-hydra/issues/1706)) ([3489417](https://github.com/ExodusMovement/exodus-hydra/commit/3489417b5a570e16d272a24a3d09ba06d63a94db))
- migrate nfts cache atom ([#1679](https://github.com/ExodusMovement/exodus-hydra/issues/1679)) ([a28b814](https://github.com/ExodusMovement/exodus-hydra/commit/a28b814138c71af47c47be50cefb386e38eeb7c3))
- migrate nfts config atoms to nfts repo ([#1711](https://github.com/ExodusMovement/exodus-hydra/issues/1711)) ([e8664d3](https://github.com/ExodusMovement/exodus-hydra/commit/e8664d3f628f9bbb958037c09227e583b798550c))
- migrate nfts monitor ([#1668](https://github.com/ExodusMovement/exodus-hydra/issues/1668)) ([b59fb70](https://github.com/ExodusMovement/exodus-hydra/commit/b59fb7097f9b601f92dd76ef897141afc905c8f4))
- unify NFTs monitors ([#1686](https://github.com/ExodusMovement/exodus-hydra/issues/1686)) ([14e3065](https://github.com/ExodusMovement/exodus-hydra/commit/14e3065cbb3b4bf1e9e6a755ddfabfd5450ab4e3))
- unify nfts monitors internally ([#1703](https://github.com/ExodusMovement/exodus-hydra/issues/1703)) ([3ce1322](https://github.com/ExodusMovement/exodus-hydra/commit/3ce13228f8d7ee6ee40627a6a268752e5bd88bf7))
