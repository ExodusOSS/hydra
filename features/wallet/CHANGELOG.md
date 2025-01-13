# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [15.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@15.0.0...@exodus/wallet@15.1.0) (2024-10-14)

### Features

- allow supplying the wallet sdk as adapter to headless ([#9317](https://github.com/ExodusMovement/exodus-hydra/issues/9317)) ([de4dcca](https://github.com/ExodusMovement/exodus-hydra/commit/de4dccabd0126e28e5de08c946e60056eb9d149a))
- expose all wallet module methods via api ([#9009](https://github.com/ExodusMovement/exodus-hydra/issues/9009)) ([877e133](https://github.com/ExodusMovement/exodus-hydra/commit/877e133bf1c739ac95fd654a6144f8dd8494a9ff))
- use atoms v9 ([#9651](https://github.com/ExodusMovement/exodus-hydra/issues/9651)) ([524aa61](https://github.com/ExodusMovement/exodus-hydra/commit/524aa61f69c81e6ac00b2f94ea830688a105b3e4))

### Bug Fixes

- correctly declare optional params for create/import ([#9022](https://github.com/ExodusMovement/exodus-hydra/issues/9022)) ([6089d60](https://github.com/ExodusMovement/exodus-hydra/commit/6089d60c759260a616aca4623ae31500219baead))
- update wallet factory config type ([#8998](https://github.com/ExodusMovement/exodus-hydra/issues/8998)) ([88a9f9b](https://github.com/ExodusMovement/exodus-hydra/commit/88a9f9b41a5cd6b9c5e203c01ac456d5e4898313))

## [15.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@14.7.0...@exodus/wallet@15.0.0) (2024-09-04)

### ⚠ BREAKING CHANGES

- **wallet:** remove wallet.seed (#8744)

### Features

- **multi-seed:** store compatibility mode with extra seed ([#8571](https://github.com/ExodusMovement/exodus-hydra/issues/8571)) ([1852fb9](https://github.com/ExodusMovement/exodus-hydra/commit/1852fb9ea0258383daca2278faea3eb82a90be3d))

### Code Refactoring

- **wallet:** remove wallet.seed ([#8744](https://github.com/ExodusMovement/exodus-hydra/issues/8744)) ([b2a7a9f](https://github.com/ExodusMovement/exodus-hydra/commit/b2a7a9fda862b0bdb1f4a25af82077aab0334827))

## [14.7.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@14.6.0...@exodus/wallet@14.7.0) (2024-08-21)

### Features

- **wallet:** convert to valid esm ([#8579](https://github.com/ExodusMovement/exodus-hydra/issues/8579)) ([f6d7eff](https://github.com/ExodusMovement/exodus-hydra/commit/f6d7eff1237f974540ff3d0454cb9819d7ddbe82))

## [14.6.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@14.5.5...@exodus/wallet@14.6.0) (2024-08-16)

### Features

- create wallet accounts for seedIds without them ([#8476](https://github.com/ExodusMovement/exodus-hydra/issues/8476)) ([a0c4434](https://github.com/ExodusMovement/exodus-hydra/commit/a0c443476e23bcdf945ae8e538eb84572ddf758d))

## [14.5.5](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@14.5.4...@exodus/wallet@14.5.5) (2024-08-05)

### Bug Fixes

- **multi-seed:** ensure re-adding extra seed wrapper in correct format ([#8197](https://github.com/ExodusMovement/exodus-hydra/issues/8197)) ([cbdf59f](https://github.com/ExodusMovement/exodus-hydra/commit/cbdf59f16524339af0fd1b4788e842a437f5e41a))

## [14.5.4](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@14.5.3...@exodus/wallet@14.5.4) (2024-08-01)

### Bug Fixes

- **wallet:** remove seeds from keychain ([#8170](https://github.com/ExodusMovement/exodus-hydra/issues/8170)) ([918358c](https://github.com/ExodusMovement/exodus-hydra/commit/918358cbf6f3535c83e379884fc982c75d8014fd))

## [14.5.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@14.5.2...@exodus/wallet@14.5.3) (2024-07-25)

### Bug Fixes

- migrate definitions ([#8030](https://github.com/ExodusMovement/exodus-hydra/issues/8030)) ([d2dfde5](https://github.com/ExodusMovement/exodus-hydra/commit/d2dfde55dfa843eb52842f64b3aac3a6f9a59069))

## [14.5.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@14.5.1...@exodus/wallet@14.5.2) (2024-07-18)

**Note:** Version bump only for package @exodus/wallet

## [14.5.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@14.5.0...@exodus/wallet@14.5.1) (2024-07-16)

### Bug Fixes

- use key identifier with enumerable derivation path ([#7854](https://github.com/ExodusMovement/exodus-hydra/issues/7854)) ([afd9653](https://github.com/ExodusMovement/exodus-hydra/commit/afd96533198a870568a83c4ecf03ead17d7797c1))

## [14.5.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@14.4.1...@exodus/wallet@14.5.0) (2024-07-08)

### Features

- allow getting mnemonic for extra seeds ([#7665](https://github.com/ExodusMovement/exodus-hydra/issues/7665)) ([2cb4823](https://github.com/ExodusMovement/exodus-hydra/commit/2cb482378d7f95f4764a5ff5e634971762f1cc8f))

## [14.4.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@14.4.0...@exodus/wallet@14.4.1) (2024-06-25)

**Note:** Version bump only for package @exodus/wallet

## [14.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@14.3.0...@exodus/wallet@14.4.0) (2024-06-21)

### Features

- support more mnemonic lengths ([#7467](https://github.com/ExodusMovement/exodus-hydra/issues/7467)) ([885fb9d](https://github.com/ExodusMovement/exodus-hydra/commit/885fb9d86a6e3d91d9d46f2bf040f9595462a689))

## [14.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@14.2.1...@exodus/wallet@14.3.0) (2024-06-19)

### Features

- allow removing seeds ([#7437](https://github.com/ExodusMovement/exodus-hydra/issues/7437)) ([44842a8](https://github.com/ExodusMovement/exodus-hydra/commit/44842a874dc2958a38ba28ccf79219d7b8450bf9))

## [14.2.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@14.2.0...@exodus/wallet@14.2.1) (2024-06-18)

### Bug Fixes

- add migrations directory to wallet package files ([#7413](https://github.com/ExodusMovement/exodus-hydra/issues/7413)) ([ffddc13](https://github.com/ExodusMovement/exodus-hydra/commit/ffddc13ecec0294efa6e449d0c134659dc607ce6))

## [14.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@14.1.1...@exodus/wallet@14.2.0) (2024-06-17)

### Features

- add primary seed metadata migration ([#7398](https://github.com/ExodusMovement/exodus-hydra/issues/7398)) ([89e68c3](https://github.com/ExodusMovement/exodus-hydra/commit/89e68c386d82b4fbf60cc4b988142f801928acdf))

## [14.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@14.1.0...@exodus/wallet@14.1.1) (2024-04-23)

### Bug Fixes

- use `Date.now()` for dateCreated ([#6635](https://github.com/ExodusMovement/exodus-hydra/issues/6635)) ([fca531e](https://github.com/ExodusMovement/exodus-hydra/commit/fca531e5323162d06c098f7e669f07f2ca5b3b09))

## [14.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@14.0.0...@exodus/wallet@14.1.0) (2024-04-23)

### Features

- add useAutoGeneratedPassword option to wallet ([#6320](https://github.com/ExodusMovement/exodus-hydra/issues/6320)) ([d775f82](https://github.com/ExodusMovement/exodus-hydra/commit/d775f82b524e335c9c0e5961a07725e611578392)), closes [#6321](https://github.com/ExodusMovement/exodus-hydra/issues/6321)
- type remaining API methods shipped with headless ([#6619](https://github.com/ExodusMovement/exodus-hydra/issues/6619)) ([d1ec08e](https://github.com/ExodusMovement/exodus-hydra/commit/d1ec08e695f0df2c9e63b01169c746ef872fe541))
- update default wallet account with mode and seed id ([#6091](https://github.com/ExodusMovement/exodus-hydra/issues/6091)) ([311061f](https://github.com/ExodusMovement/exodus-hydra/commit/311061fea6b6fb5bfea6bb8992ae01fa475f50d1))

### Bug Fixes

- clear seedMetadataAtom on clear wallet ([#6472](https://github.com/ExodusMovement/exodus-hydra/issues/6472)) ([7eec478](https://github.com/ExodusMovement/exodus-hydra/commit/7eec4786166b748230359d5ecb6459f9b79d3b7b))
- fix `wallet.create` and `wallet.import` raceyness ([#6268](https://github.com/ExodusMovement/exodus-hydra/issues/6268)) ([08dea60](https://github.com/ExodusMovement/exodus-hydra/commit/08dea60cfe5a62adc15cf3742d7296f82b5b1680))

## [14.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@13.0.0...@exodus/wallet@14.0.0) (2024-03-11)

### ⚠ BREAKING CHANGES

- remove `get{Public,Private}Key` (#5923)

### Features

- remove `get{Public,Private}Key` ([#5923](https://github.com/ExodusMovement/exodus-hydra/issues/5923)) ([82cdd9e](https://github.com/ExodusMovement/exodus-hydra/commit/82cdd9eb5fe9521194727fc948d753fc5a8ef3b1))

## [13.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@12.0.0...@exodus/wallet@13.0.0) (2024-03-08)

### ⚠ BREAKING CHANGES

- support feature config (#6003)
- pass compatibility mode into wallet (#5950)

### Features

- add seed metadata ([#5877](https://github.com/ExodusMovement/exodus-hydra/issues/5877)) ([e219eb9](https://github.com/ExodusMovement/exodus-hydra/commit/e219eb9044bc3a69d5d5cee32d972686fc1533b6))
- expose seed methods from wallet api ([#5968](https://github.com/ExodusMovement/exodus-hydra/issues/5968)) ([36df220](https://github.com/ExodusMovement/exodus-hydra/commit/36df2203893f5ca0c1e80d1bd6a69e8979d583b7))
- pass compatibility mode into wallet ([#5950](https://github.com/ExodusMovement/exodus-hydra/issues/5950)) ([76ee8dd](https://github.com/ExodusMovement/exodus-hydra/commit/76ee8dd4a81c46ab47acc1361fa2b923195617cb))
- support feature config ([#6003](https://github.com/ExodusMovement/exodus-hydra/issues/6003)) ([639d7c4](https://github.com/ExodusMovement/exodus-hydra/commit/639d7c45c5d55dc3d5780bb729c386d1b9f9c272))

## [12.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@11.0.0...@exodus/wallet@12.0.0) (2024-02-22)

### ⚠ BREAKING CHANGES

- add support for multiple seeds in wallet module (#5705)
- kill wallet.signTransaction (#5649)

### Features

- add support for multiple seeds in wallet module ([#5705](https://github.com/ExodusMovement/exodus-hydra/issues/5705)) ([0bf464d](https://github.com/ExodusMovement/exodus-hydra/commit/0bf464d9da1316512af6451b5565f3b415aa63b5)), closes [#5733](https://github.com/ExodusMovement/exodus-hydra/issues/5733)
- don't allow addSeed to add duplicates, cap maxExtraSeeds ([#5747](https://github.com/ExodusMovement/exodus-hydra/issues/5747)) ([26be462](https://github.com/ExodusMovement/exodus-hydra/commit/26be46252f6d1c55abb374d2d5d2aabca1a19d77))
- kill wallet.signTransaction ([#5649](https://github.com/ExodusMovement/exodus-hydra/issues/5649)) ([f6696d0](https://github.com/ExodusMovement/exodus-hydra/commit/f6696d01eb542532636e68519ac84bac5cdd3653))

### Bug Fixes

- **api:** pass correct arguments to getDefaultPurpose ([#5751](https://github.com/ExodusMovement/exodus-hydra/issues/5751)) ([fb0ad82](https://github.com/ExodusMovement/exodus-hydra/commit/fb0ad82427b9bedb502c26b9ce5617de0cc77752))

## [11.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@10.5.0...@exodus/wallet@11.0.0) (2024-01-25)

### ⚠ BREAKING CHANGES

- make wallet application agnostic (#5469)
- **wallet:** make public api receive base asset (#5503)
- **wallet:** remove wallet accounts dependency from api (#5496)

### Features

- make wallet application agnostic ([#5469](https://github.com/ExodusMovement/exodus-hydra/issues/5469)) ([5edce20](https://github.com/ExodusMovement/exodus-hydra/commit/5edce206e12d35a6acdccd597bc52352772ed9c3))
- remove wallet accounts dependency from wallet ([#5471](https://github.com/ExodusMovement/exodus-hydra/issues/5471)) ([65559fc](https://github.com/ExodusMovement/exodus-hydra/commit/65559fc7d2ab6b6f881db843a4af73644cb172b2))
- **wallet:** make public api receive base asset ([#5503](https://github.com/ExodusMovement/exodus-hydra/issues/5503)) ([b32abb7](https://github.com/ExodusMovement/exodus-hydra/commit/b32abb7251f509b8107f98e93194cc3823c3a419))
- **wallet:** remove wallet accounts dependency from api ([#5496](https://github.com/ExodusMovement/exodus-hydra/issues/5496)) ([71d2afa](https://github.com/ExodusMovement/exodus-hydra/commit/71d2afa566c2eee16b450ec2f5906b9d014637a1))

## [10.5.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@10.4.0...@exodus/wallet@10.5.0) (2024-01-11)

### Features

- **wallet:** support get publicKey for Monero struct ([#5334](https://github.com/ExodusMovement/exodus-hydra/issues/5334)) ([c01ed59](https://github.com/ExodusMovement/exodus-hydra/commit/c01ed59f93a9053371172af32f29951dd268c65b))

### Bug Fixes

- missing dependencies ([#5322](https://github.com/ExodusMovement/exodus-hydra/issues/5322)) ([01efedc](https://github.com/ExodusMovement/exodus-hydra/commit/01efedc7508fb14925277fdcd388afb721ac3dd1))

## [10.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@10.3.0...@exodus/wallet@10.4.0) (2023-12-21)

### Features

- allow force restore ([#4953](https://github.com/ExodusMovement/exodus-hydra/issues/4953)) ([10d5e06](https://github.com/ExodusMovement/exodus-hydra/commit/10d5e06b00830fcdfe3c66698bbd729fbd8b3efe))

### Bug Fixes

- remove bitcoin-lib and solana-lib dependencies from wallet api's export private key ([#5156](https://github.com/ExodusMovement/exodus-hydra/issues/5156)) ([36dfb86](https://github.com/ExodusMovement/exodus-hydra/commit/36dfb860932c11892ca105522f353061bae98ea6))

## [10.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@10.2.1...@exodus/wallet@10.3.0) (2023-11-30)

### Features

- make passphrase cache optional ([#4915](https://github.com/ExodusMovement/exodus-hydra/issues/4915)) ([1a5738b](https://github.com/ExodusMovement/exodus-hydra/commit/1a5738b830e200012d271ff5553e5985dd3ffe7c))

## [10.2.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@10.2.0...@exodus/wallet@10.2.1) (2023-11-23)

**Note:** Version bump only for package @exodus/wallet

## [10.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@10.1.0...@exodus/wallet@10.2.0) (2023-11-09)

### Features

- accept `purpose` parameter in `wallet.getPublicKey` ([#4689](https://github.com/ExodusMovement/exodus-hydra/issues/4689)) ([2656980](https://github.com/ExodusMovement/exodus-hydra/commit/2656980b7137c44001a35dbc8023543dab551f1a))

## [10.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@10.0.2...@exodus/wallet@10.1.0) (2023-10-26)

### Features

- add wallet age to risk metric computation ([#4435](https://github.com/ExodusMovement/exodus-hydra/issues/4435)) ([93aec20](https://github.com/ExodusMovement/exodus-hydra/commit/93aec20f2e8a983f78e6bcc3db8f0a71b1c7ed20))
- adding asset.api extensions for address provider ([#4576](https://github.com/ExodusMovement/exodus-hydra/issues/4576)) ([2a9c4ff](https://github.com/ExodusMovement/exodus-hydra/commit/2a9c4ff68c0f1dd72576805ffdc46ac2011ea482))

## [10.0.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@10.0.1...@exodus/wallet@10.0.2) (2023-10-20)

### Bug Fixes

- import from atoms index ([#4508](https://github.com/ExodusMovement/exodus-hydra/issues/4508)) ([923fb99](https://github.com/ExodusMovement/exodus-hydra/commit/923fb992328b63e45401c78176b5a6ef7b666eee))

## [10.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@10.0.0...@exodus/wallet@10.0.1) (2023-10-19)

### Bug Fixes

- **wallet:** handle issue when detecting compatibility mode ([#4450](https://github.com/ExodusMovement/exodus-hydra/issues/4450)) ([f5f93e2](https://github.com/ExodusMovement/exodus-hydra/commit/f5f93e29777ca201b189e179bca4679eb7bea32f))

## [10.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@9.3.1...@exodus/wallet@10.0.0) (2023-10-05)

### ⚠ BREAKING CHANGES

- use transaction signer (#3751)

### Features

- use transaction signer ([#3751](https://github.com/ExodusMovement/exodus-hydra/issues/3751)) ([0e60e89](https://github.com/ExodusMovement/exodus-hydra/commit/0e60e8963a799435c5528f596447813b9e012ead))
- **wallet:** observe atoms ([#4191](https://github.com/ExodusMovement/exodus-hydra/issues/4191)) ([47dfdfd](https://github.com/ExodusMovement/exodus-hydra/commit/47dfdfdfec8fdb7e437d42e916f51aaa1dbd4f7c))

## [9.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@9.3.1...@exodus/wallet@9.4.0) (2023-09-22)

### Features

- **wallet:** observe atoms ([#4191](https://github.com/ExodusMovement/exodus-hydra/issues/4191)) ([47dfdfd](https://github.com/ExodusMovement/exodus-hydra/commit/47dfdfdfec8fdb7e437d42e916f51aaa1dbd4f7c))

## [9.3.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@9.3.0...@exodus/wallet@9.3.1) (2023-09-16)

**Note:** Version bump only for package @exodus/wallet

## [9.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@9.2.0...@exodus/wallet@9.3.0) (2023-08-23)

### Features

- add restartAutoLockTimer to wallet api ([#3552](https://github.com/ExodusMovement/exodus-hydra/issues/3552)) ([0de829d](https://github.com/ExodusMovement/exodus-hydra/commit/0de829d4ff321ed7cd340f9a6c16567a6f1bc74f))

## [9.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@9.1.0...@exodus/wallet@9.2.0) (2023-08-22)

### Features

- accept `purpose` parameter in `getPrivateKey` ([#3475](https://github.com/ExodusMovement/exodus-hydra/issues/3475)) ([f953063](https://github.com/ExodusMovement/exodus-hydra/commit/f95306330b1f6add2119c013b0307336a6e4e1de))

## [9.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@9.0.0...@exodus/wallet@9.1.0) (2023-08-11)

### Features

- **wallet:** export key methods ([#3318](https://github.com/ExodusMovement/exodus-hydra/issues/3318)) ([e65e7b8](https://github.com/ExodusMovement/exodus-hydra/commit/e65e7b889a64de351040f87b7632f7ae2b487b33))

## [9.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@8.1.1...@exodus/wallet@9.0.0) (2023-08-09)

### ⚠ BREAKING CHANGES

- add stop lifecycle hook (#3251)

### Features

- add stop lifecycle hook ([#3251](https://github.com/ExodusMovement/exodus-hydra/issues/3251)) ([e713074](https://github.com/ExodusMovement/exodus-hydra/commit/e7130744f557087aa5ae65bddc2f0bea63f6c1e3))

## [8.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@8.1.0...@exodus/wallet@8.1.1) (2023-07-25)

### Bug Fixes

- restoreAtom ([#2878](https://github.com/ExodusMovement/exodus-hydra/issues/2878)) ([8725a49](https://github.com/ExodusMovement/exodus-hydra/commit/8725a49ad51c0658b15c6604b333b6479bef64d9))

## [8.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@8.0.1...@exodus/wallet@8.1.0) (2023-07-20)

### Features

- **wallet:** backed up atom ([#2745](https://github.com/ExodusMovement/exodus-hydra/issues/2745)) ([9750ee2](https://github.com/ExodusMovement/exodus-hydra/commit/9750ee2aadcdd25b0175425a61d2fbad22cddeb2))

## [8.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@8.0.0...@exodus/wallet@8.0.1) (2023-07-18)

### Bug Fixes

- restore progress tracker ([#2662](https://github.com/ExodusMovement/exodus-hydra/issues/2662)) ([cbe506e](https://github.com/ExodusMovement/exodus-hydra/commit/cbe506eab083ba1f7cf3d4c85f28dc108db202df))

## [8.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@7.0.1...@exodus/wallet@8.0.0) (2023-07-17)

### ⚠ BREAKING CHANGES

- walletCompatibilityModes to lazy access of assets (#2647)

### Code Refactoring

- walletCompatibilityModes to lazy access of assets ([#2647](https://github.com/ExodusMovement/exodus-hydra/issues/2647)) ([c34736c](https://github.com/ExodusMovement/exodus-hydra/commit/c34736c339fb9ffba6607b8944a54ed8543d9015))

## [7.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@7.0.0...@exodus/wallet@7.0.1) (2023-07-17)

### Bug Fixes

- restore-plugin and restore-progress-tracker ([#2642](https://github.com/ExodusMovement/exodus-hydra/issues/2642)) ([d7f704f](https://github.com/ExodusMovement/exodus-hydra/commit/d7f704f877651ffa9eb087476c5ba8322caf2f0e))

## [7.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@6.3.0...@exodus/wallet@7.0.0) (2023-07-14)

### ⚠ BREAKING CHANGES

- accept baseAssetName instead of assetName in wallet.signTx and wallet.signTransaction (#2621)

### Code Refactoring

- accept baseAssetName instead of assetName in wallet.signTx and wallet.signTransaction ([#2621](https://github.com/ExodusMovement/exodus-hydra/issues/2621)) ([0f617e6](https://github.com/ExodusMovement/exodus-hydra/commit/0f617e6eee49abbd56ed19cd4ac56cef84df9130))

## [6.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@6.2.0...@exodus/wallet@6.3.0) (2023-07-06)

### Features

- add `lockHistoryAtom` ([#2348](https://github.com/ExodusMovement/exodus-hydra/issues/2348)) ([7a2c029](https://github.com/ExodusMovement/exodus-hydra/commit/7a2c02917b44d02cfb6d71fa9928bfe0f44ab82c))
- export `wallet` feature ([#2345](https://github.com/ExodusMovement/exodus-hydra/issues/2345)) ([3c5f636](https://github.com/ExodusMovement/exodus-hydra/commit/3c5f6363b7d158ab4b47c28475907e33587f7587))

## [6.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@6.1.0...@exodus/wallet@6.2.0) (2023-06-26)

### Features

- verify mnemonic on import ([#2112](https://github.com/ExodusMovement/exodus-hydra/issues/2112)) ([68b7619](https://github.com/ExodusMovement/exodus-hydra/commit/68b7619da78d4e608134923fe9a32c9c57dfda31))

## [6.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@6.0.1...@exodus/wallet@6.1.0) (2023-06-17)

### Features

- delete compatibility mode flag ([#1984](https://github.com/ExodusMovement/exodus-hydra/issues/1984)) ([3a6faee](https://github.com/ExodusMovement/exodus-hydra/commit/3a6faee1368ff82a2ea0a8e6dc3f09434d2f1fb2))

## [6.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@6.0.0...@exodus/wallet@6.0.1) (2023-04-25)

**Note:** Version bump only for package @exodus/wallet

## [6.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@5.1.0...@exodus/wallet@6.0.0) (2023-04-24)

### ⚠ BREAKING CHANGES

- pass compatibility modes config to wallet (#1223)

### Features

- pass compatibility modes config to wallet ([#1223](https://github.com/ExodusMovement/exodus-hydra/issues/1223)) ([b49b640](https://github.com/ExodusMovement/exodus-hydra/commit/b49b64097af7969e210e5ecf5395ee7f40a13eac))

## [5.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@5.0.1...@exodus/wallet@5.1.0) (2023-04-13)

### Features

- keychain.clone for compatibility modes ([#1218](https://github.com/ExodusMovement/exodus-hydra/issues/1218)) ([b0cc050](https://github.com/ExodusMovement/exodus-hydra/commit/b0cc050eeced8b43fb0a973fa50e3c16f667a327))

## [5.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@5.0.0...@exodus/wallet@5.0.1) (2023-04-10)

### Features

- do not use seedStorage.clear ([#1152](https://github.com/ExodusMovement/exodus-hydra/issues/1152)) ([377db62](https://github.com/ExodusMovement/exodus-hydra/commit/377db62b74f9637703e955cbbef9f2131a760afb))

## [5.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@4.1.0...@exodus/wallet@5.0.0) (2023-04-04)

### ⚠ BREAKING CHANGES

- pass seed storage adapter to wallet (#1066)

### Features

- pass seed storage adapter to wallet ([#1066](https://github.com/ExodusMovement/exodus-hydra/issues/1066)) ([d3f57a3](https://github.com/ExodusMovement/exodus-hydra/commit/d3f57a32f51b3d29a851ed497797ab585c0ad104))

## [4.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@4.0.0...@exodus/wallet@4.1.0) (2023-03-21)

### Features

- wallet-compatibility-modes module ([#992](https://github.com/ExodusMovement/exodus-hydra/issues/992)) ([1662e21](https://github.com/ExodusMovement/exodus-hydra/commit/1662e2140ff13dea3a608aecb0d68a5142e4e68c))

### Bug Fixes

- add privateKey shortcut to signTx param ([#993](https://github.com/ExodusMovement/exodus-hydra/issues/993)) ([c7f993c](https://github.com/ExodusMovement/exodus-hydra/commit/c7f993c16a125e869d5cb7337606a77d8a4879d1))

## [4.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@3.0.1...@exodus/wallet@4.0.0) (2023-02-17)

### ⚠ BREAKING CHANGES

- **wallet:** constructor args to accept `config` and `seco` (#900)
- **wallet:** export from module/ folder, using DI definition (#898)

### Code Refactoring

- **wallet:** constructor args to accept `config` and `seco` ([#900](https://github.com/ExodusMovement/exodus-hydra/issues/900)) ([151761f](https://github.com/ExodusMovement/exodus-hydra/commit/151761f0e7634739e505c6e1e193d97a25c53125))
- **wallet:** export from module/ folder, using DI definition ([#898](https://github.com/ExodusMovement/exodus-hydra/issues/898)) ([c1a3c85](https://github.com/ExodusMovement/exodus-hydra/commit/c1a3c851f62f9e2186e27c20a807f6a81c18a8b7))

## [3.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@3.0.0...@exodus/wallet@3.0.1) (2023-01-17)

**Note:** Version bump only for package @exodus/wallet

## [3.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/wallet@2.0.0...@exodus/wallet@3.0.0) (2023-01-11)

### Bug Fixes

- add wallet.isLocked ([#698](https://github.com/ExodusMovement/exodus-hydra/issues/698)) ([adb4272](https://github.com/ExodusMovement/exodus-hydra/commit/adb42722a669974d5307a2fc32ea97accb94d894))
- getDefaultPathIndexes parseInt ([#654](https://github.com/ExodusMovement/exodus-hydra/issues/654)) ([b6ab5af](https://github.com/ExodusMovement/exodus-hydra/commit/b6ab5af98b85b78155f81b1a4d43689eb375443a))

### Features

- Compatibility modes IOC ([#655](https://github.com/ExodusMovement/exodus-hydra/pull/655)) ([bf024c](https://github.com/ExodusMovement/exodus-hydra/commit/bf024c22b309ff6ad522679e0b119d5907b9eeb2))

## 2.0.0 (2022-12-21)

### ⚠ BREAKING CHANGES

- lockedAtom in wallet module (#562)

### Features

- add new signTransaction and getPublicKey ([#629](https://github.com/ExodusMovement/exodus-hydra/issues/629)) ([e4216a](https://github.com/ExodusMovement/exodus-hydra/commit/e4216a74edb384cf485a3574f60f699d390bd118))
- add change password screen ([#68](https://github.com/ExodusMovement/exodus-hydra/issues/68)) ([478fc39](https://github.com/ExodusMovement/exodus-hydra/commit/478fc3915d8353cce48401826773d50526eaff5f))
- add Fusion modules with shims ([#183](https://github.com/ExodusMovement/exodus-hydra/issues/183)) ([d0bfab6](https://github.com/ExodusMovement/exodus-hydra/commit/d0bfab6134f5309b9c490ede58558ad2e07ff158))
- add Phantom restore ([#741](https://github.com/ExodusMovement/exodus-hydra/issues/741)) ([b4046e6](https://github.com/ExodusMovement/exodus-hydra/commit/b4046e6c48c1c185b419af75afc15aaa4c6626c4))
- add View Private Key screen ([#75](https://github.com/ExodusMovement/exodus-hydra/issues/75)) ([00572b2](https://github.com/ExodusMovement/exodus-hydra/commit/00572b2b5ae996677efe5e19457d422d1e9a3d21))
- contacts logic ([#195](https://github.com/ExodusMovement/exodus-hydra/issues/195)) ([cf5befa](https://github.com/ExodusMovement/exodus-hydra/commit/cf5befac88611ab43793da3ccbce08912b3be52a))
- fine-tune password creation and backup flows ([#2212](https://github.com/ExodusMovement/exodus-hydra/issues/2212)) ([a35573b](https://github.com/ExodusMovement/exodus-hydra/commit/a35573b487d1bf85dc2fbd4c5666ffdad1d19fe2))
- Import seed phrase ([#58](https://github.com/ExodusMovement/exodus-hydra/issues/58)) ([6606540](https://github.com/ExodusMovement/exodus-hydra/commit/660654085f3572ecfe03a489e87fff43803884a1))
- **keychain:** extract keychain as dependency ([#446](https://github.com/ExodusMovement/exodus-hydra/issues/446)) ([2fbb201](https://github.com/ExodusMovement/exodus-hydra/commit/2fbb201589546f2a4ecaaecf55ad2bb1ab7701b5))
- **keychain:** initial implementation ([#39](https://github.com/ExodusMovement/exodus-hydra/issues/39)) ([fc44170](https://github.com/ExodusMovement/exodus-hydra/commit/fc44170b90ff41af94adae2fb24197a51e4b1003))
- lock / unlock wallet ([#42](https://github.com/ExodusMovement/exodus-hydra/issues/42)) ([8dcbd73](https://github.com/ExodusMovement/exodus-hydra/commit/8dcbd73c60dbca6e63f459fe80b236ac208e235a))
- lockedAtom in wallet module ([#562](https://github.com/ExodusMovement/exodus-hydra/issues/562)) ([de25e46](https://github.com/ExodusMovement/exodus-hydra/commit/de25e4675644d5de14c12d1b5aaf53c45a0403ba))
- move password creation from onboarding to backup ([#1436](https://github.com/ExodusMovement/exodus-hydra/issues/1436)) ([cf38888](https://github.com/ExodusMovement/exodus-hydra/commit/cf38888b30109da4275c17ab4400990c951171c9))
- **storage:** use encrypted storage for contacts ([#447](https://github.com/ExodusMovement/exodus-hydra/issues/447)) ([ae3a613](https://github.com/ExodusMovement/exodus-hydra/commit/ae3a61380f82aad2acd9070628bc5a6b5a7a6bf3))
- wallet emit lifecycle methods (lock/unlock) ([#963](https://github.com/ExodusMovement/exodus-hydra/issues/963)) ([fb7b8e3](https://github.com/ExodusMovement/exodus-hydra/commit/fb7b8e3ae1cb72ce24e8f4b02b6a9a04de478349))

### Bug Fixes

- backup flow misc issues ([#2241](https://github.com/ExodusMovement/exodus-hydra/issues/2241)) ([6285830](https://github.com/ExodusMovement/exodus-hydra/commit/6285830e37531011ee13e2e0fcb6fccbf5928a91))
- clear generated passphrase on restore ([#2130](https://github.com/ExodusMovement/exodus-hydra/issues/2130)) ([62e8d32](https://github.com/ExodusMovement/exodus-hydra/commit/62e8d328407ce91ef6c841c0eb586e699c897864))
- set wallet to locked after deletion ([#168](https://github.com/ExodusMovement/exodus-hydra/issues/168)) ([73a109e](https://github.com/ExodusMovement/exodus-hydra/commit/73a109e21396854144163157c2c14fecd2688cd7))
- use baseAsset in key identifier & asset name in address cache ([#1240](https://github.com/ExodusMovement/exodus-hydra/issues/1240)) ([b041c4b](https://github.com/ExodusMovement/exodus-hydra/commit/b041c4bcbc29ce27f660738d8d5dbe5398d4784b)), closes [#1249](https://github.com/ExodusMovement/exodus-hydra/issues/1249)
