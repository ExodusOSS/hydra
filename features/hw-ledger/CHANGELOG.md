# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.6.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@3.6.0...@exodus/hw-ledger@3.6.1) (2025-09-01)

### Bug Fixes

- fix: only sign for required wallet policies (#13720)

## [3.6.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@3.5.0...@exodus/hw-ledger@3.6.0) (2025-07-18)

### Features

- feat: bump bs58check to v3 (#13274)

## [3.5.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@3.4.3...@exodus/hw-ledger@3.5.0) (2025-05-30)

### Features

- feat: switch hw-ledger from metamask/eth-sig-util to our fixed impl (#12750)

## [3.4.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@3.4.2...@exodus/hw-ledger@3.4.3) (2025-03-05)

### Bug Fixes

- fix: bump bip32 (#11415)

## [3.4.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@3.4.1...@exodus/hw-ledger@3.4.2) (2024-12-20)

### License

- license: re-license under MIT license (#10599)

## [3.4.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@3.4.0...@exodus/hw-ledger@3.4.1) (2024-10-30)

### Bug Fixes

- bump bip322 to latest ([#10231](https://github.com/ExodusMovement/exodus-hydra/issues/10231)) ([4aacf39](https://github.com/ExodusMovement/exodus-hydra/commit/4aacf399a1e8679d99f08574920463bcab6f07fa))

## [3.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@3.3.1...@exodus/hw-ledger@3.4.0) (2024-10-30)

### Features

- add Tron support to ledger ([#10108](https://github.com/ExodusMovement/exodus-hydra/issues/10108)) ([ce6cace](https://github.com/ExodusMovement/exodus-hydra/commit/ce6cace76803c08841976cfa7fc2f8e2ea346923))
- drop unused exports from bip322 ([#10142](https://github.com/ExodusMovement/exodus-hydra/issues/10142)) ([6c1a268](https://github.com/ExodusMovement/exodus-hydra/commit/6c1a2687130bdf88ff78c38a599c950c84ae8f60))

## [3.3.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@3.3.0...@exodus/hw-ledger@3.3.1) (2024-10-24)

### Bug Fixes

- support legacy transaction signing ([#10154](https://github.com/ExodusMovement/exodus-hydra/issues/10154)) ([55c3d63](https://github.com/ExodusMovement/exodus-hydra/commit/55c3d63e809397b94aa08309b03715fe6d0ed831))

## [3.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@3.2.0...@exodus/hw-ledger@3.3.0) (2024-10-22)

### Features

- support cancelling an action on the ledger device ([#10105](https://github.com/ExodusMovement/exodus-hydra/issues/10105)) ([f1c1fbf](https://github.com/ExodusMovement/exodus-hydra/commit/f1c1fbff6ec70b7ddc68dd700ffb556b673b7a5a))

## [3.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@3.1.0...@exodus/hw-ledger@3.2.0) (2024-10-21)

### Features

- add testnets support for ledger ([#10080](https://github.com/ExodusMovement/exodus-hydra/issues/10080)) ([81d0602](https://github.com/ExodusMovement/exodus-hydra/commit/81d060295c4a1a33b182db690beb4cfe5ab8cac7))

## [3.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@3.0.0...@exodus/hw-ledger@3.1.0) (2024-10-17)

### Features

- support adding model to wallet account ([#9936](https://github.com/ExodusMovement/exodus-hydra/issues/9936)) ([8c858f6](https://github.com/ExodusMovement/exodus-hydra/commit/8c858f6e08e41bee3261f444c3d25e8bdd385014))

### Bug Fixes

- unify user refused error handling ([#10052](https://github.com/ExodusMovement/exodus-hydra/issues/10052)) ([db85d10](https://github.com/ExodusMovement/exodus-hydra/commit/db85d108333630d09bad545c5ec1169b937e08fe))

## [3.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@2.13.1...@exodus/hw-ledger@3.0.0) (2024-10-15)

### ⚠ BREAKING CHANGES

- remove `getFirstDevice` from hardware wallet discovery (#9821)

### Features

- remove `getFirstDevice` from hardware wallet discovery ([#9821](https://github.com/ExodusMovement/exodus-hydra/issues/9821)) ([ad3e902](https://github.com/ExodusMovement/exodus-hydra/commit/ad3e902fd9e27dfccd8311089b6d966767cc6d0a))

## [2.13.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@2.13.0...@exodus/hw-ledger@2.13.1) (2024-10-09)

**Note:** Version bump only for package @exodus/hw-ledger

## [2.13.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@2.12.0...@exodus/hw-ledger@2.13.0) (2024-10-03)

### Features

- update bip32 to 3.3.0 ([#9721](https://github.com/ExodusMovement/exodus-hydra/issues/9721)) ([eb08369](https://github.com/ExodusMovement/exodus-hydra/commit/eb08369df93ed7239cb106e095b143da0032e174))

## [2.11.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@2.11.0...@exodus/hw-ledger@2.11.1) (2024-10-01)

### Features

- use internal xpub for multisig hardware wallet policy ([#9639](https://github.com/ExodusMovement/exodus-hydra/issues/9639)) ([e96bee0](https://github.com/ExodusMovement/exodus-hydra/commit/e96bee045b3799a43464db4487d42a980ef95f0f))

## [2.11.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@2.10.0...@exodus/hw-ledger@2.11.0) (2024-09-23)

### Features

- add more metadata to unsupported version error ([#9267](https://github.com/ExodusMovement/exodus-hydra/issues/9267)) ([1a78d90](https://github.com/ExodusMovement/exodus-hydra/commit/1a78d9032bd97dfb77967be90d5cfad2678035b9))

## [2.10.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@2.9.5...@exodus/hw-ledger@2.10.0) (2024-09-16)

### Features

- add bitcoin multisig support to ledger ([#9218](https://github.com/ExodusMovement/exodus-hydra/issues/9218)) ([1b63e8a](https://github.com/ExodusMovement/exodus-hydra/commit/1b63e8a6ac7bab9cd580f602f2fd0cbff48ed01c))

## [2.9.5](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@2.9.4...@exodus/hw-ledger@2.9.5) (2024-08-16)

### Bug Fixes

- bluetooth on scan ([#8457](https://github.com/ExodusMovement/exodus-hydra/issues/8457)) ([c6cef7a](https://github.com/ExodusMovement/exodus-hydra/commit/c6cef7a19dad315bdbe8e01ea353f108348d48e3))
- use safe alloc ([#8467](https://github.com/ExodusMovement/exodus-hydra/issues/8467)) ([926ef36](https://github.com/ExodusMovement/exodus-hydra/commit/926ef36d1478e8fea290b56eabab5c807e7e6695))

## [2.9.4](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@2.9.3...@exodus/hw-ledger@2.9.4) (2024-08-14)

### Bug Fixes

- EVM clear signing for NFTs ([#8402](https://github.com/ExodusMovement/exodus-hydra/issues/8402)) ([8fe5815](https://github.com/ExodusMovement/exodus-hydra/commit/8fe58152fdf12516cdf1f13fc3f91186eefd9028))

## [2.9.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@2.9.2...@exodus/hw-ledger@2.9.3) (2024-08-08)

### Bug Fixes

- **ledger:** properly order asset names array ([#7915](https://github.com/ExodusMovement/exodus-hydra/issues/7915)) ([e982d63](https://github.com/ExodusMovement/exodus-hydra/commit/e982d639354234bf93ae27e5f06876895a88aab0))

## [2.9.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@2.9.1...@exodus/hw-ledger@2.9.2) (2024-07-25)

### Bug Fixes

- migrate definitions ([#8030](https://github.com/ExodusMovement/exodus-hydra/issues/8030)) ([d2dfde5](https://github.com/ExodusMovement/exodus-hydra/commit/d2dfde55dfa843eb52842f64b3aac3a6f9a59069))

## [2.9.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@2.9.0...@exodus/hw-ledger@2.9.1) (2024-07-18)

**Note:** Version bump only for package @exodus/hw-ledger

## [2.9.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@2.8.1...@exodus/hw-ledger@2.9.0) (2024-07-16)

### Features

- **hw-ledger:** expose bluetooth status to clients ([#7848](https://github.com/ExodusMovement/exodus-hydra/issues/7848)) ([36943b1](https://github.com/ExodusMovement/exodus-hydra/commit/36943b194c286a07c44dd78bd3a1f03324c87ce8))

## [2.8.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@2.8.0...@exodus/hw-ledger@2.8.1) (2024-07-10)

### Bug Fixes

- **ledger:** fix selectors ([#7744](https://github.com/ExodusMovement/exodus-hydra/issues/7744)) ([11ad709](https://github.com/ExodusMovement/exodus-hydra/commit/11ad7098314c1a7dee014765bfc0500d9636b4df))

## [2.8.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@2.7.0...@exodus/hw-ledger@2.8.0) (2024-07-10)

### Features

- **ledger:** add redux module ([#7734](https://github.com/ExodusMovement/exodus-hydra/issues/7734)) ([a26cb0a](https://github.com/ExodusMovement/exodus-hydra/commit/a26cb0ae76730d20ad6bbbb931f7c0f28094dbf4))

### Bug Fixes

- **ledger:** add missing atom ([#7731](https://github.com/ExodusMovement/exodus-hydra/issues/7731)) ([34b77d5](https://github.com/ExodusMovement/exodus-hydra/commit/34b77d5f3a7a1aca97646137e94b42758e5aaa85))

## [2.7.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@2.6.0...@exodus/hw-ledger@2.7.0) (2024-07-04)

### Features

- **ledger:** add `bluetoothScanningAtom` atom to indicate if scanning ([#7645](https://github.com/ExodusMovement/exodus-hydra/issues/7645)) ([bc377ea](https://github.com/ExodusMovement/exodus-hydra/commit/bc377ea7c4b1dd3a33b892791b80ea53e8ec2b58))
- **ledger:** support retrieving BLE status ([#7631](https://github.com/ExodusMovement/exodus-hydra/issues/7631)) ([22eebc1](https://github.com/ExodusMovement/exodus-hydra/commit/22eebc1a059c502644f515897aefd1b4ef268cad))

## [2.6.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@2.5.1...@exodus/hw-ledger@2.6.0) (2024-07-03)

### Features

- **ledger:** support retrieving name & model ([#7597](https://github.com/ExodusMovement/exodus-hydra/issues/7597)) ([a3210d7](https://github.com/ExodusMovement/exodus-hydra/commit/a3210d7db77b44119bca90b6e7d4507e4012b4cf))

## [2.5.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@2.5.0...@exodus/hw-ledger@2.5.1) (2024-05-27)

### Bug Fixes

- order base & eth ([#7126](https://github.com/ExodusMovement/exodus-hydra/issues/7126)) ([63b7408](https://github.com/ExodusMovement/exodus-hydra/commit/63b7408dac094fa0a0d178fd2a4b0e89e74fdbcf))

## [2.5.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@2.4.1...@exodus/hw-ledger@2.5.0) (2024-04-18)

### Features

- **ledger:** add basemainnet ([#6564](https://github.com/ExodusMovement/exodus-hydra/issues/6564)) ([e156669](https://github.com/ExodusMovement/exodus-hydra/commit/e156669e8da97d7317e949f256f7005a8c9ae02c))

## [2.4.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@2.4.0...@exodus/hw-ledger@2.4.1) (2024-03-15)

### Bug Fixes

- don't infinitely hang ([#6143](https://github.com/ExodusMovement/exodus-hydra/issues/6143)) ([3f97e86](https://github.com/ExodusMovement/exodus-hydra/commit/3f97e8603ad5e49a7be3841bb62b01e3d082c9ea))

## [2.4.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@2.3.1...@exodus/hw-ledger@2.4.0) (2024-03-06)

### Features

- add bluetooth support ([#5998](https://github.com/ExodusMovement/exodus-hydra/issues/5998)) ([6160b9e](https://github.com/ExodusMovement/exodus-hydra/commit/6160b9eec796afe0109699b6e1c3291fbaeeede1))

## [2.3.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@2.3.0...@exodus/hw-ledger@2.3.1) (2024-02-13)

### Bug Fixes

- add dummy inputs when signing psbt on ledger ([#5680](https://github.com/ExodusMovement/exodus-hydra/issues/5680)) ([b11c6c6](https://github.com/ExodusMovement/exodus-hydra/commit/b11c6c67db196d7b970ded3228e7482ff1881c57))

## [2.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@2.2.6...@exodus/hw-ledger@2.3.0) (2024-02-08)

### Features

- add bip322 message support to Ledger ([#5641](https://github.com/ExodusMovement/exodus-hydra/issues/5641)) ([b89dd27](https://github.com/ExodusMovement/exodus-hydra/commit/b89dd27435e8894f9a4ad3a10c88c0f7d165f9a0))

## [2.2.6](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@2.2.5...@exodus/hw-ledger@2.2.6) (2024-01-31)

### Bug Fixes

- bump ledger deps ([#5564](https://github.com/ExodusMovement/exodus-hydra/issues/5564)) ([07a6d9b](https://github.com/ExodusMovement/exodus-hydra/commit/07a6d9bd415f3d0d8b7136e95ebc821cf702ab92))

## [2.2.5](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@2.2.4...@exodus/hw-ledger@2.2.5) (2024-01-26)

### Bug Fixes

- move ethereum-abi to devDeps ([#5519](https://github.com/ExodusMovement/exodus-hydra/issues/5519)) ([3d37539](https://github.com/ExodusMovement/exodus-hydra/commit/3d37539361af78c1892e61adf149990a55bb8ce0))
- unpin deps to allow dedupe for ledger ([#5522](https://github.com/ExodusMovement/exodus-hydra/issues/5522)) ([6a7199b](https://github.com/ExodusMovement/exodus-hydra/commit/6a7199b60bfe5ba47eb82104814c7f90da562451))

## [2.2.4](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@2.2.3...@exodus/hw-ledger@2.2.4) (2024-01-23)

### Bug Fixes

- build wallet policy with correct xpub ([#5488](https://github.com/ExodusMovement/exodus-hydra/issues/5488)) ([d25dd95](https://github.com/ExodusMovement/exodus-hydra/commit/d25dd9503828b957e3c6206758325bd21b0dffbe))

## [2.2.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@2.2.2...@exodus/hw-ledger@2.2.3) (2024-01-23)

### Bug Fixes

- allow signing bitcoin transactions with multiple wallet policies ([#5479](https://github.com/ExodusMovement/exodus-hydra/issues/5479)) ([92a923b](https://github.com/ExodusMovement/exodus-hydra/commit/92a923b8bf30413040d6aa346281ae1b3d5ec8d8))

## [2.2.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@2.2.1...@exodus/hw-ledger@2.2.2) (2024-01-18)

### Bug Fixes

- proper error handling for eth ([#5447](https://github.com/ExodusMovement/exodus-hydra/issues/5447)) ([4f72307](https://github.com/ExodusMovement/exodus-hydra/commit/4f72307b52c6dcd2584a7bf347139b9b7cf42387))

## [2.2.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@2.2.0...@exodus/hw-ledger@2.2.1) (2024-01-16)

### Bug Fixes

- generalize errors for blind signing ([#5421](https://github.com/ExodusMovement/exodus-hydra/issues/5421)) ([cb0a009](https://github.com/ExodusMovement/exodus-hydra/commit/cb0a009d06b750691b80021f7a9de5f073a117a7))

## [2.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@2.1.1...@exodus/hw-ledger@2.2.0) (2024-01-11)

### Features

- support signing matic transactions with ethereum app on ledger ([#5329](https://github.com/ExodusMovement/exodus-hydra/issues/5329)) ([55eda94](https://github.com/ExodusMovement/exodus-hydra/commit/55eda944b78e1714a2b7215731febf399167a85b))

## [2.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@2.1.0...@exodus/hw-ledger@2.1.1) (2024-01-11)

### Bug Fixes

- missing dependencies ([#5322](https://github.com/ExodusMovement/exodus-hydra/issues/5322)) ([01efedc](https://github.com/ExodusMovement/exodus-hydra/commit/01efedc7508fb14925277fdcd388afb721ac3dd1))
- skip ethereum parity v normalization ([#5330](https://github.com/ExodusMovement/exodus-hydra/issues/5330)) ([7408190](https://github.com/ExodusMovement/exodus-hydra/commit/740819013c486a67302298fa6e3e9c981f42014c))

## [2.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@2.0.0...@exodus/hw-ledger@2.1.0) (2023-12-25)

### Features

- add matic support ([#5172](https://github.com/ExodusMovement/exodus-hydra/issues/5172)) ([c8817c2](https://github.com/ExodusMovement/exodus-hydra/commit/c8817c250d42459b9583990bd6d0460d90f9a17a))

## [2.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@1.3.2...@exodus/hw-ledger@2.0.0) (2023-12-19)

### ⚠ BREAKING CHANGES

- simplify transaction signing api for ledger (#4979)

### Features

- add nested segwit to bitcoin ([#4981](https://github.com/ExodusMovement/exodus-hydra/issues/4981)) ([3721b60](https://github.com/ExodusMovement/exodus-hydra/commit/3721b607ea5176ad8461d4b97ac803e179f8a48f))
- add psbt tagging & sanitization to ledger ([#5059](https://github.com/ExodusMovement/exodus-hydra/issues/5059)) ([9e38c3b](https://github.com/ExodusMovement/exodus-hydra/commit/9e38c3b33c6beb67b1feee6eaf939c5a500da94a))
- simplify transaction signing api for ledger ([#4979](https://github.com/ExodusMovement/exodus-hydra/issues/4979)) ([30b1d45](https://github.com/ExodusMovement/exodus-hydra/commit/30b1d45602614c8b37cff926acaf830142fbf197))

### Bug Fixes

- bump ledger packages ([#4990](https://github.com/ExodusMovement/exodus-hydra/issues/4990)) ([a3f60fc](https://github.com/ExodusMovement/exodus-hydra/commit/a3f60fc6dca2c0bbbdb37e6446d3b4f4438e2753))
- change polygon asset name to matic ([#4955](https://github.com/ExodusMovement/exodus-hydra/issues/4955)) ([e3d5ec3](https://github.com/ExodusMovement/exodus-hydra/commit/e3d5ec3e0d7e3f1a31082ca7bb77a13bb0ca3207))

## [1.3.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@1.3.2...@exodus/hw-ledger@1.3.3) (2023-12-11)

### Bug Fixes

- bump ledger packages ([#4990](https://github.com/ExodusMovement/exodus-hydra/issues/4990)) ([a3f60fc](https://github.com/ExodusMovement/exodus-hydra/commit/a3f60fc6dca2c0bbbdb37e6446d3b4f4438e2753))
- change polygon asset name to matic ([#4955](https://github.com/ExodusMovement/exodus-hydra/issues/4955)) ([e3d5ec3](https://github.com/ExodusMovement/exodus-hydra/commit/e3d5ec3e0d7e3f1a31082ca7bb77a13bb0ca3207))

## [1.3.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@1.3.1...@exodus/hw-ledger@1.3.2) (2023-12-05)

### Bug Fixes

- bump min required bitcoin firmware ([#4954](https://github.com/ExodusMovement/exodus-hydra/issues/4954)) ([ff19dfa](https://github.com/ExodusMovement/exodus-hydra/commit/ff19dfa3656ebf04d7f023f30a659a25a4f1c233))

## [1.3.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@1.3.0...@exodus/hw-ledger@1.3.1) (2023-11-28)

### Bug Fixes

- ledger removed isEIP712Message export ([#4911](https://github.com/ExodusMovement/exodus-hydra/issues/4911)) ([dccbd2f](https://github.com/ExodusMovement/exodus-hydra/commit/dccbd2f7e53050e6132e2537f87571f70d445946))

## [1.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@1.2.0...@exodus/hw-ledger@1.3.0) (2023-11-28)

### Features

- add ability to retrieve supported, installed and useable assets ([#4901](https://github.com/ExodusMovement/exodus-hydra/issues/4901)) ([d821590](https://github.com/ExodusMovement/exodus-hydra/commit/d82159062aa497c1ae5bbe4362cce8a2aff0cc9c))
- add generic `Message` type in `SignMessageParams` ([#4895](https://github.com/ExodusMovement/exodus-hydra/issues/4895)) ([fb688ea](https://github.com/ExodusMovement/exodus-hydra/commit/fb688ea071c18a1a041bbd53869f7afdce2c0b1d))
- add ledger `getFirstDevice` helper ([#4897](https://github.com/ExodusMovement/exodus-hydra/issues/4897)) ([6a2b362](https://github.com/ExodusMovement/exodus-hydra/commit/6a2b362e69b46e0d19be80394ff6f5533f6139ba))

## [1.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@1.1.0...@exodus/hw-ledger@1.2.0) (2023-11-27)

### Features

- make hw-ledger a feature ([#4882](https://github.com/ExodusMovement/exodus-hydra/issues/4882)) ([33d93fb](https://github.com/ExodusMovement/exodus-hydra/commit/33d93fb0f4bb507e3788c0450a3e413e79815433))

## [1.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/hw-ledger@1.0.0...@exodus/hw-ledger@1.1.0) (2023-08-21)

### Features

- **hw-ledger:** add application management functions ([#2586](https://github.com/ExodusMovement/exodus-hydra/issues/2586)) ([125e9ef](https://github.com/ExodusMovement/exodus-hydra/commit/125e9efc835a56a66375e43f9072404af28f466d))
- **hw-ledger:** add bitcoin transaction & message signing support ([#2530](https://github.com/ExodusMovement/exodus-hydra/issues/2530)) ([5d17826](https://github.com/ExodusMovement/exodus-hydra/commit/5d17826335f6e85ba3b9179bb7a2343f686751fb))
- **hw-ledger:** add ethereum transaction signing ([#2315](https://github.com/ExodusMovement/exodus-hydra/issues/2315)) ([5b5c60e](https://github.com/ExodusMovement/exodus-hydra/commit/5b5c60e950948d24cea672e37dc171e1d7348343))
- **hw-ledger:** add polygon support ([#2293](https://github.com/ExodusMovement/exodus-hydra/issues/2293)) ([fd66005](https://github.com/ExodusMovement/exodus-hydra/commit/fd660055b0813917dd4055c408f8731ea448ad4f))
- **hw-ledger:** add prebuilt firmware ([#2212](https://github.com/ExodusMovement/exodus-hydra/issues/2212)) ([80667a4](https://github.com/ExodusMovement/exodus-hydra/commit/80667a4237a103c08e55dbf634a193dda0875ca0))
- **hw-ledger:** add solana transaction & message signing ([#2357](https://github.com/ExodusMovement/exodus-hydra/issues/2357)) ([2ca2a4e](https://github.com/ExodusMovement/exodus-hydra/commit/2ca2a4e93f813b1777953355c4d271033e7d98d0))
- **hw-ledger:** add Taproot address support ([#2442](https://github.com/ExodusMovement/exodus-hydra/issues/2442)) ([4d8350e](https://github.com/ExodusMovement/exodus-hydra/commit/4d8350ecbdca500e6b69a36ce83c7b4c63bb0e8f))
- **hw-ledger:** automatically open the application ([#2801](https://github.com/ExodusMovement/exodus-hydra/issues/2801)) ([80e04b4](https://github.com/ExodusMovement/exodus-hydra/commit/80e04b49ee886cc3ca9b65695a567d06b0909928))
- **hw-ledger:** bitcoin address derivation ([#2181](https://github.com/ExodusMovement/exodus-hydra/issues/2181)) ([19b77ec](https://github.com/ExodusMovement/exodus-hydra/commit/19b77ec223d998454843d82c4c47a4350e77299e))
- **hw-ledger:** ethereum address generation ([#2213](https://github.com/ExodusMovement/exodus-hydra/issues/2213)) ([1c5b326](https://github.com/ExodusMovement/exodus-hydra/commit/1c5b326d7fbbcf66ff6cb820c35c1e1d1d127821))
- **hw-ledger:** ethereum message signing ([#3058](https://github.com/ExodusMovement/exodus-hydra/issues/3058)) ([df07d2d](https://github.com/ExodusMovement/exodus-hydra/commit/df07d2d861cc20c1db366b47dc98802dd8e73f9c))
- **hw-ledger:** solana address derivation ([#2211](https://github.com/ExodusMovement/exodus-hydra/issues/2211)) ([1c73d28](https://github.com/ExodusMovement/exodus-hydra/commit/1c73d28798801016966a8034a3538b9abc4cbf16))
- **ledger:** add ethereum xpub support ([#3403](https://github.com/ExodusMovement/exodus-hydra/issues/3403)) ([7de98d2](https://github.com/ExodusMovement/exodus-hydra/commit/7de98d22080bcb46a9fe88e30d631a5ace3a923d))

### Bug Fixes

- **hw-ledger:** support NFT transactions on Nano S ([#2961](https://github.com/ExodusMovement/exodus-hydra/issues/2961)) ([1161a80](https://github.com/ExodusMovement/exodus-hydra/commit/1161a807c581211132d56ec2912bc27b683207d1))
- missing dependencies ([#2408](https://github.com/ExodusMovement/exodus-hydra/issues/2408)) ([7791f2a](https://github.com/ExodusMovement/exodus-hydra/commit/7791f2aa10f318b0a3c8f932ec686fbe0cf16617))
