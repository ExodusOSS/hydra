# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [13.7.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@13.6.2...@exodus/balances@13.7.0) (2025-02-27)

### Features

- feat: update @exodus/errors for latest SafeError (#11608)

## [13.6.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@13.6.1...@exodus/balances@13.6.2) (2025-02-21)

### Bug Fixes

- fix: skip exporting most reports if wallet doesn't exist (#11553)

## [13.6.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@13.6.0...@exodus/balances@13.6.1) (2025-02-12)

### Performance

- perf: memoize createInitialPerAssetData per asset (#11417)

## [13.6.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@13.5.4...@exodus/balances@13.6.0) (2025-01-21)

### Features

- feat: createBalances selector (#11171)

## [13.5.4](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@13.5.3...@exodus/balances@13.5.4) (2025-01-17)

### Bug Fixes

- fix: balance typo "stakeable" (#11131)

## [13.5.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@13.5.2...@exodus/balances@13.5.3) (2025-01-06)

### Bug Fixes

- fix: filter by available asset names in balances (#10962)

## [13.5.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@13.5.1...@exodus/balances@13.5.2) (2025-01-03)

### Bug Fixes

- fix: only compute balances for available assets (#10958)

## [13.5.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@13.5.0...@exodus/balances@13.5.1) (2024-11-29)

### Bug Fixes

- fix: balances map equality check (#10620)

## [13.5.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@13.4.0...@exodus/balances@13.5.0) (2024-11-29)

### Features

- feat: add various crypto balance props (#10419)

## [13.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@13.3.2...@exodus/balances@13.4.0) (2024-11-25)

### Features

- feat: use atoms v9 (#9651)

### Bug Fixes

- fix: balances tests (#9738)

### License

- license: re-license under MIT license (#10580)

## [13.3.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@13.3.1...@exodus/balances@13.3.2) (2024-09-13)

### Bug Fixes

- log instead of throwing ([#9147](https://github.com/ExodusMovement/exodus-hydra/issues/9147)) ([499f002](https://github.com/ExodusMovement/exodus-hydra/commit/499f002ddb2d35fab3d7b18b59cac07476ea6ee0))

## [13.3.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@13.3.0...@exodus/balances@13.3.1) (2024-09-09)

**Note:** Version bump only for package @exodus/balances

## [13.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@13.2.3...@exodus/balances@13.3.0) (2024-08-21)

### Features

- convert balances to valid ESM ([#8590](https://github.com/ExodusMovement/exodus-hydra/issues/8590)) ([e64fc29](https://github.com/ExodusMovement/exodus-hydra/commit/e64fc290dd7b3cea7adb41fe2b41084a83980a6b))

## [13.2.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@13.2.2...@exodus/balances@13.2.3) (2024-07-25)

### Bug Fixes

- migrate definitions ([#8030](https://github.com/ExodusMovement/exodus-hydra/issues/8030)) ([d2dfde5](https://github.com/ExodusMovement/exodus-hydra/commit/d2dfde55dfa843eb52842f64b3aac3a6f9a59069))

## [13.2.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@13.2.1...@exodus/balances@13.2.2) (2024-07-18)

**Note:** Version bump only for package @exodus/balances

## [13.2.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@13.2.0...@exodus/balances@13.2.1) (2024-06-26)

### Bug Fixes

- using right currency on fuelThreshold ([#7522](https://github.com/ExodusMovement/exodus-hydra/issues/7522)) ([1c87c6e](https://github.com/ExodusMovement/exodus-hydra/commit/1c87c6e67c8d930bbb0e1605173da138c1ef1be5))

## [13.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@13.1.2...@exodus/balances@13.2.0) (2024-05-29)

### Features

- fuel threshold selectors ([#7161](https://github.com/ExodusMovement/exodus-hydra/issues/7161)) ([a6cf8d7](https://github.com/ExodusMovement/exodus-hydra/commit/a6cf8d7fcea6590e2ebbd0da11d51922a8620d78))

## [13.1.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@13.1.1...@exodus/balances@13.1.2) (2024-04-26)

### Bug Fixes

- initial total balance ([#6687](https://github.com/ExodusMovement/exodus-hydra/issues/6687)) ([fe1be40](https://github.com/ExodusMovement/exodus-hydra/commit/fe1be4075576246954ad57fef077815fa382a26b))

## [13.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@13.1.0...@exodus/balances@13.1.1) (2024-04-09)

### Bug Fixes

- don't recompute if asset already exist in balances ([#6410](https://github.com/ExodusMovement/exodus-hydra/issues/6410)) ([f7160cc](https://github.com/ExodusMovement/exodus-hydra/commit/f7160ccf90deb046a12f23f9f42bd78e74bb2859))

## [13.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@13.0.1...@exodus/balances@13.1.0) (2024-04-09)

### Features

- asset-names-with-balance atom ([#6406](https://github.com/ExodusMovement/exodus-hydra/issues/6406)) ([f006357](https://github.com/ExodusMovement/exodus-hydra/commit/f006357b81478fcb443d478d626cec89196f57cf))

### Bug Fixes

- use `assetNamesWithBalanceAtomDefinition` ([#6425](https://github.com/ExodusMovement/exodus-hydra/issues/6425)) ([9b65a23](https://github.com/ExodusMovement/exodus-hydra/commit/9b65a2367778d50c877a5c235784ee47938d101a))

## [13.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@13.0.0...@exodus/balances@13.0.1) (2024-04-05)

### Bug Fixes

- dedupe funded-wallet-accounts ([#6399](https://github.com/ExodusMovement/exodus-hydra/issues/6399)) ([bb9c97f](https://github.com/ExodusMovement/exodus-hydra/commit/bb9c97f08aed19a4b3390c1ec9ba46a1459a249c))

## [13.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@12.6.1...@exodus/balances@13.0.0) (2024-03-21)

### ⚠ BREAKING CHANGES

- assets balance fields (#5933)
- replace confirmedBalance with spendableBalance in balances (#5931)

### Features

- assets balance fields ([#5933](https://github.com/ExodusMovement/exodus-hydra/issues/5933)) ([000eb65](https://github.com/ExodusMovement/exodus-hydra/commit/000eb653d9424b2a427f087009a2cc0dd5d0b3ea))
- new balances selectors ([#6083](https://github.com/ExodusMovement/exodus-hydra/issues/6083)) ([cd369d2](https://github.com/ExodusMovement/exodus-hydra/commit/cd369d2a9dab3666bcb789c3ebf9e13b8059e634))

### Code Refactoring

- replace confirmedBalance with spendableBalance in balances ([#5931](https://github.com/ExodusMovement/exodus-hydra/issues/5931)) ([a121bfd](https://github.com/ExodusMovement/exodus-hydra/commit/a121bfde20a1ce8da4fb66e930f9f3e6996df583))

## [12.6.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@12.6.0...@exodus/balances@12.6.1) (2024-01-15)

### Bug Fixes

- **balances:** expose assetsWithBalanceCountAtom ([#5398](https://github.com/ExodusMovement/exodus-hydra/issues/5398)) ([37ecfcc](https://github.com/ExodusMovement/exodus-hydra/commit/37ecfcc97995293e018ff96cb9286e3aa6a62599))

## [12.6.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@12.5.1...@exodus/balances@12.6.0) (2024-01-12)

### Features

- move assets with balances count atom to balances module ([#5379](https://github.com/ExodusMovement/exodus-hydra/issues/5379)) ([4d86b5a](https://github.com/ExodusMovement/exodus-hydra/commit/4d86b5a080cf9cf8bebf029e474cfe138a73d49e))

## [12.5.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@12.5.0...@exodus/balances@12.5.1) (2024-01-11)

### Bug Fixes

- unconfirmed balance selector must account only for incomming txs ([#5351](https://github.com/ExodusMovement/exodus-hydra/issues/5351)) ([4cf6565](https://github.com/ExodusMovement/exodus-hydra/commit/4cf656532f7b336734d3fc091f00e92642b5fa9c))

## [12.5.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@12.4.0...@exodus/balances@12.5.0) (2024-01-11)

### Features

- require default properties before flushing events ([#5342](https://github.com/ExodusMovement/exodus-hydra/issues/5342)) ([925d711](https://github.com/ExodusMovement/exodus-hydra/commit/925d71116130793ed8c26ecf2a6c46c23d726e25))

### Bug Fixes

- missing dependencies ([#5322](https://github.com/ExodusMovement/exodus-hydra/issues/5322)) ([01efedc](https://github.com/ExodusMovement/exodus-hydra/commit/01efedc7508fb14925277fdcd388afb721ac3dd1))

## [12.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@12.3.0...@exodus/balances@12.4.0) (2024-01-08)

### Features

- **balances:** analytics plugin ([#5287](https://github.com/ExodusMovement/exodus-hydra/issues/5287)) ([91de7ba](https://github.com/ExodusMovement/exodus-hydra/commit/91de7ba2fc0563f49b1a5e39dd5546cea4415a6b))

## [12.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@12.2.0...@exodus/balances@12.3.0) (2024-01-05)

### Features

- add selector to compute balance by asset ([#5258](https://github.com/ExodusMovement/exodus-hydra/issues/5258)) ([4d50ddc](https://github.com/ExodusMovement/exodus-hydra/commit/4d50ddca485d1da794fafe04f40b1fef97a982ec))

## [12.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@12.1.0...@exodus/balances@12.2.0) (2024-01-03)

### Features

- **balances:** new unconfirmed balance selector to improve performance ([#5234](https://github.com/ExodusMovement/exodus-hydra/issues/5234)) ([9c97b66](https://github.com/ExodusMovement/exodus-hydra/commit/9c97b6618c0fa494763d76431aa4bbf915495091))

## [12.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@12.0.1...@exodus/balances@12.1.0) (2023-12-14)

### Features

- **balances:** funded wallet accounts atom ([#5074](https://github.com/ExodusMovement/exodus-hydra/issues/5074)) ([dc98436](https://github.com/ExodusMovement/exodus-hydra/commit/dc98436d5f8bbade4ceab85af60455ac3b4efa49))
- remove storing oldBalances in balances atoms ([#5073](https://github.com/ExodusMovement/exodus-hydra/issues/5073)) ([414db86](https://github.com/ExodusMovement/exodus-hydra/commit/414db866a86aaf3242e68698596af187da6927c3))

## [12.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@12.0.0...@exodus/balances@12.0.1) (2023-12-12)

### Bug Fixes

- **balances:** reducer changes computation when balances not loaded ([#5008](https://github.com/ExodusMovement/exodus-hydra/issues/5008))08) ([01e50c9](https://github.com/ExodusMovement/exodus-hydra/commit/01e50c9ef852b542855aad8abf25db3eaeca76a0))

## [12.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@11.2.2...@exodus/balances@12.0.0) (2023-11-23)

### ⚠ BREAKING CHANGES

- use `assetsAtom` instead of legacy event (#4838)

### Features

- has balance stored ([#4856](https://github.com/ExodusMovement/exodus-hydra/issues/4856)) ([510ffd5](https://github.com/ExodusMovement/exodus-hydra/commit/510ffd517c22bbbcb16441275f1ab71ffcc7de90))

### Bug Fixes

- cleanup subscriptions on stop ([#4814](https://github.com/ExodusMovement/exodus-hydra/issues/4814)) ([d053582](https://github.com/ExodusMovement/exodus-hydra/commit/d0535826c2023dd4d3273b367bbcc5cca6e4bb95))
- zero balance after send is ignore ([#4725](https://github.com/ExodusMovement/exodus-hydra/issues/4725)) ([56c5d35](https://github.com/ExodusMovement/exodus-hydra/commit/56c5d35ca1643e869c112d0166df036ec988088f))

### Code Refactoring

- use `assetsAtom` instead of legacy event ([#4838](https://github.com/ExodusMovement/exodus-hydra/issues/4838)) ([33260c3](https://github.com/ExodusMovement/exodus-hydra/commit/33260c3fd48286d00a940a4e5ec4956326f8c3c1))

## [11.2.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@11.2.1...@exodus/balances@11.2.2) (2023-11-06)

### Bug Fixes

- **balances:** do not count failed outgoing TX amount as unconfirmed ([#4624](https://github.com/ExodusMovement/exodus-hydra/issues/4624)) ([aa59950](https://github.com/ExodusMovement/exodus-hydra/commit/aa5995001a772f767dc077a5fed2ccf6b4efdd60))
- omit failed TX amount when calculating unconfirmed amount ([#4693](https://github.com/ExodusMovement/exodus-hydra/issues/4693)) ([f54c36d](https://github.com/ExodusMovement/exodus-hydra/commit/f54c36db046adffdc25100b386966a78bf542922))

## [11.2.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@11.2.0...@exodus/balances@11.2.1) (2023-10-30)

### Bug Fixes

- update createInitialPerAssetData signature in balances ([#4625](https://github.com/ExodusMovement/exodus-hydra/issues/4625)) ([253a587](https://github.com/ExodusMovement/exodus-hydra/commit/253a587705d8f0c1e1042f38484050890883e177))

## [11.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@11.1.0...@exodus/balances@11.2.0) (2023-10-25)

### Features

- add selector to compute unconfirmed balance ([#4552](https://github.com/ExodusMovement/exodus-hydra/issues/4552)) ([a3b5217](https://github.com/ExodusMovement/exodus-hydra/commit/a3b52173c5cf3dd23aa7f1f21aea62f9e09f6b58))

## [11.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@11.0.3...@exodus/balances@11.1.0) (2023-10-20)

### Features

- warn on different number unit ([#4512](https://github.com/ExodusMovement/exodus-hydra/issues/4512)) ([d11cbc7](https://github.com/ExodusMovement/exodus-hydra/commit/d11cbc770535cb5f978526d5634a391b1bd4146f))

## [11.0.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@11.0.2...@exodus/balances@11.0.3) (2023-10-20)

### Bug Fixes

- import from atoms index ([#4508](https://github.com/ExodusMovement/exodus-hydra/issues/4508)) ([923fb99](https://github.com/ExodusMovement/exodus-hydra/commit/923fb992328b63e45401c78176b5a6ef7b666eee))

## [11.0.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@11.0.1...@exodus/balances@11.0.2) (2023-09-07)

### Bug Fixes

- ignore changes ([#3881](https://github.com/ExodusMovement/exodus-hydra/issues/3881)) ([7a8e069](https://github.com/ExodusMovement/exodus-hydra/commit/7a8e0695d2c20f76c7bc1d496bfea22c23256a5c))

## [11.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@11.0.0...@exodus/balances@11.0.1) (2023-09-06)

### Bug Fixes

- initial state ([#3869](https://github.com/ExodusMovement/exodus-hydra/issues/3869)) ([adb2b3d](https://github.com/ExodusMovement/exodus-hydra/commit/adb2b3d796773b82fb62ce018e73f957220781aa))

## [11.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@10.0.0...@exodus/balances@11.0.0) (2023-09-06)

### ⚠ BREAKING CHANGES

- balances redux (#3749)

### Features

- balances redux ([#3749](https://github.com/ExodusMovement/exodus-hydra/issues/3749)) ([52ddf33](https://github.com/ExodusMovement/exodus-hydra/commit/52ddf33e37ac92c197edc9163853339bb366b9de))

## [10.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@9.1.1...@exodus/balances@10.0.0) (2023-08-31)

### ⚠ BREAKING CHANGES

- accept feature config (#3789)

### Features

- accept feature config ([#3789](https://github.com/ExodusMovement/exodus-hydra/issues/3789)) ([beac45f](https://github.com/ExodusMovement/exodus-hydra/commit/beac45fd516383b1ab48fc077a417cbc06ba9f5b))

## [9.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@9.1.0...@exodus/balances@9.1.1) (2023-08-28)

### Bug Fixes

- don't try to find tokens for tokens ([#3663](https://github.com/ExodusMovement/exodus-hydra/issues/3663)) ([1e9e3cc](https://github.com/ExodusMovement/exodus-hydra/commit/1e9e3ccfe6339160d9a7b01dc96e5b36b6e78e3f))

## [9.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@9.0.0...@exodus/balances@9.1.0) (2023-08-25)

### Features

- add atom observer in balances plugin ([#3578](https://github.com/ExodusMovement/exodus-hydra/issues/3578)) ([ec01242](https://github.com/ExodusMovement/exodus-hydra/commit/ec012429d0230619fd03caa05c46dff5ec85e559))

## [9.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@8.1.0...@exodus/balances@9.0.0) (2023-08-21)

### ⚠ BREAKING CHANGES

- balances.load (#3383)

### Features

- balances.load ([#3383](https://github.com/ExodusMovement/exodus-hydra/issues/3383)) ([754179f](https://github.com/ExodusMovement/exodus-hydra/commit/754179f65713afc19490240702aa0fee18047073))

## [8.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@8.0.0...@exodus/balances@8.1.0) (2023-08-11)

### Features

- emit balances atom value through port ([#3314](https://github.com/ExodusMovement/exodus-hydra/issues/3314)) ([c394b71](https://github.com/ExodusMovement/exodus-hydra/commit/c394b718c85f5ceb5e1f3788fafd218c624ee83b))

## [8.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@7.1.0...@exodus/balances@8.0.0) (2023-08-03)

### ⚠ BREAKING CHANGES

- balances to use txLogsAtom and accountStatesAtom (#2900)

### Features

- add balances report ([#3059](https://github.com/ExodusMovement/exodus-hydra/issues/3059)) ([a06ae1c](https://github.com/ExodusMovement/exodus-hydra/commit/a06ae1c988fb9abc8899caa0093528495496df1f))

### Bug Fixes

- **balances:** include report in package files ([#3130](https://github.com/ExodusMovement/exodus-hydra/issues/3130)) ([b0e515c](https://github.com/ExodusMovement/exodus-hydra/commit/b0e515c7c32d271303b77b82780cdae80540c1f5))

### Code Refactoring

- balances to use txLogsAtom and accountStatesAtom ([#2900](https://github.com/ExodusMovement/exodus-hydra/issues/2900)) ([7aa3c74](https://github.com/ExodusMovement/exodus-hydra/commit/7aa3c74fd8a646e47f3c326c9c82662d99515814))

## [7.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@7.1.0...@exodus/balances@7.2.0) (2023-08-01)

### Features

- add balances report ([#3059](https://github.com/ExodusMovement/exodus-hydra/issues/3059)) ([a06ae1c](https://github.com/ExodusMovement/exodus-hydra/commit/a06ae1c988fb9abc8899caa0093528495496df1f))

## [7.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@6.1.0...@exodus/balances@7.1.0) (2023-07-21)

### Features

- **balances:** has balance atom ([#2761](https://github.com/ExodusMovement/exodus-hydra/issues/2761)) ([1b9e51e](https://github.com/ExodusMovement/exodus-hydra/commit/1b9e51e3074e368840832fedc7da45298d442347))
- move balances to feature dir ([#2757](https://github.com/ExodusMovement/exodus-hydra/issues/2757)) ([8d0729a](https://github.com/ExodusMovement/exodus-hydra/commit/8d0729a470e9f1329814cca7e1ceb01bbc5db4b6))

### Bug Fixes

- don't crash when a single asset fails to get balance ([#2828](https://github.com/ExodusMovement/exodus-hydra/issues/2828)) ([547ddac](https://github.com/ExodusMovement/exodus-hydra/commit/547ddac4b1a7e1e81db1f3a504dacada50e9ae62))

## [7.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@6.1.0...@exodus/balances@7.0.0) (2023-07-21)

### ⚠ BREAKING CHANGES

- balances module (#2756)

### Features

- **balances:** has balance atom ([#2761](https://github.com/ExodusMovement/exodus-hydra/issues/2761)) ([1b9e51e](https://github.com/ExodusMovement/exodus-hydra/commit/1b9e51e3074e368840832fedc7da45298d442347))
- move balances to feature dir ([#2757](https://github.com/ExodusMovement/exodus-hydra/issues/2757)) ([8d0729a](https://github.com/ExodusMovement/exodus-hydra/commit/8d0729a470e9f1329814cca7e1ceb01bbc5db4b6))

## [6.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@6.0.1...@exodus/balances@6.1.0) (2023-07-19)

### Features

- capture #setWalletAccounts ([#2723](https://github.com/ExodusMovement/exodus-hydra/issues/2723)) ([af8c52b](https://github.com/ExodusMovement/exodus-hydra/commit/af8c52b6f4623e490d470b6185fafb4b771d5bcc))
- emit errors from balances module ([#2718](https://github.com/ExodusMovement/exodus-hydra/issues/2718)) ([d150e55](https://github.com/ExodusMovement/exodus-hydra/commit/d150e555c76e9fedc3defb2023f8b161ce99c5f1))

## [6.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@6.0.0...@exodus/balances@6.0.1) (2023-06-21)

**Note:** Version bump only for package @exodus/balances

## [6.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@5.0.0...@exodus/balances@6.0.0) (2023-04-25)

### ⚠ BREAKING CHANGES

- replace emit with atom in balances module (#1349)

### Features

- add balancesAtom definition ([#1362](https://github.com/ExodusMovement/exodus-hydra/issues/1362)) ([4d126ef](https://github.com/ExodusMovement/exodus-hydra/commit/4d126efef79655178ec1e1faf65b347497ad8647))
- replace emit with atom in balances module ([#1349](https://github.com/ExodusMovement/exodus-hydra/issues/1349)) ([f9110f8](https://github.com/ExodusMovement/exodus-hydra/commit/f9110f8e9e76b8b199bc4d40461cb1bed3a5be1e))

## [5.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@4.0.0...@exodus/balances@5.0.0) (2023-03-14)

### ⚠ BREAKING CHANGES

- **blockchain-metadata:** export from `module` (#911)

### Code Refactoring

- **blockchain-metadata:** export from `module` ([#911](https://github.com/ExodusMovement/exodus-hydra/issues/911)) ([4061ee9](https://github.com/ExodusMovement/exodus-hydra/commit/4061ee96c11cabd841e51a96daf302cca1240fbc))

## [4.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@3.0.0...@exodus/balances@4.0.0) (2023-02-02)

### ⚠ BREAKING CHANGES

- export balances module from module/ and auto-bind config (#828)
- accept enabled wallet accounts atom (#544)

### Features

- add `restricted-imports` eslint rule ([#719](https://github.com/ExodusMovement/exodus-hydra/issues/719)) ([175de9c](https://github.com/ExodusMovement/exodus-hydra/commit/175de9c19ec00e5a12441022c313837d58f38882))
- detect subscriptions further down the call graph ([#786](https://github.com/ExodusMovement/exodus-hydra/issues/786)) ([7abcc8f](https://github.com/ExodusMovement/exodus-hydra/commit/7abcc8f361302bbd3061688e55210e62ec684154))

### Code Refactoring

- accept enabled wallet accounts atom ([#544](https://github.com/ExodusMovement/exodus-hydra/issues/544)) ([bdeaf02](https://github.com/ExodusMovement/exodus-hydra/commit/bdeaf029b6080bbb42d575545e9b711faa21b6c8))
- export balances module from module/ and auto-bind config ([#828](https://github.com/ExodusMovement/exodus-hydra/issues/828)) ([d62d3b9](https://github.com/ExodusMovement/exodus-hydra/commit/d62d3b97554394442b0a12feb5f92ee352ec6255))

## [3.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@2.0.1...@exodus/balances@3.0.0) (2022-10-18)

### ⚠ BREAKING CHANGES

- add batching to blockchain metadata (#334)

### Features

- add batching to blockchain metadata ([#334](https://github.com/ExodusMovement/exodus-hydra/issues/334)) ([d3d612b](https://github.com/ExodusMovement/exodus-hydra/commit/d3d612bd04da18704c907163bab4978c12e3fe8c))

## [2.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@2.0.0...@exodus/balances@2.0.1) (2022-10-13)

### Bug Fixes

- include confirmed-balance in package ([#320](https://github.com/ExodusMovement/exodus-hydra/issues/320)) ([a1b8515](https://github.com/ExodusMovement/exodus-hydra/commit/a1b8515d4700bd81595662b309848b262759201a))

## [2.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@1.2.1...@exodus/balances@2.0.0) (2022-10-13)

### ⚠ BREAKING CHANGES

- add getLoadedAccountStates and emit delta events on change only (#259)

### Features

- `confirmedBalance` ([#218](https://github.com/ExodusMovement/exodus-hydra/issues/218)) ([2268ba0](https://github.com/ExodusMovement/exodus-hydra/commit/2268ba08ac4ba8cec553d3a7d9063dbad3b2e715))
- add getLoadedAccountStates and emit delta events on change only ([#259](https://github.com/ExodusMovement/exodus-hydra/issues/259)) ([783e08e](https://github.com/ExodusMovement/exodus-hydra/commit/783e08e8f944e6eba6ccbd37a2ee720d3f7e059f))

### Bug Fixes

- listen loaded event only once ([#278](https://github.com/ExodusMovement/exodus-hydra/issues/278)) ([154eaf1](https://github.com/ExodusMovement/exodus-hydra/commit/154eaf131c4a92be378f579f9762ae589a76ace4))

## [1.2.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@1.2.0...@exodus/balances@1.2.1) (2022-09-26)

Refactor(balances): provide all potentially relevant txLogs to getBalancesFromBlockchainMetadata
https://github.com/ExodusMovement/exodus-hydra/pull/223

## [1.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@1.1.2...@exodus/balances@1.2.0) (2022-09-23)

### Features

- emit balance only after blockchain metadata is loaded ([#245](https://github.com/ExodusMovement/exodus-hydra/issues/245)) ([a6348bf](https://github.com/ExodusMovement/exodus-hydra/commit/a6348bf96fa06268975f2f35fbc164ac19798695))

## [1.1.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@1.1.1...@exodus/balances@1.1.2) (2022-09-20)

**Note:** Version bump only for package @exodus/balances

- **balances:** refactor: wait till blockchain metadata is loaded ([#242](https://github.com/ExodusMovement/exodus-hydra/pull/242)) ([642b64e](https://github.com/ExodusMovement/exodus-hydra/commit/642b64e2e8ede129896834f5aef527563e9694a0))

## [1.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@1.1.0...@exodus/balances@1.1.1) (2022-09-06)

### Bug Fixes

- **fiat-balances:** undesired balance reset ([#219](https://github.com/ExodusMovement/exodus-hydra/issues/219)) ([642b64e](https://github.com/ExodusMovement/exodus-hydra/commit/642b64e2e8ede129896834f5aef527563e9694a0))

### Reverts

- Revert "refactor: always emit balance in defaultUnit (#222)" (#224) ([dd301d6](https://github.com/ExodusMovement/exodus-hydra/commit/dd301d6573a27473e7e469c466245ef513a1e64e)), closes [#222](https://github.com/ExodusMovement/exodus-hydra/issues/222) [#224](https://github.com/ExodusMovement/exodus-hydra/issues/224)

## [1.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/balances@1.0.1...@exodus/balances@1.1.0) (2022-08-25)

### Features

- bump basic-utils ([#200](https://github.com/ExodusMovement/exodus-hydra/issues/200))

### Bug Fixes

- lost token balances on portfolio recompute ([#206](https://github.com/ExodusMovement/exodus-hydra/issues/206)) ([318b8cf](https://github.com/ExodusMovement/exodus-hydra/commit/318b8cf7771d4d030f9730e94897b900c4b21c60))
