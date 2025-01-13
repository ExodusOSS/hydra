# @exodus/key-ids

This package holds key identifiers for Exodus' own BIP43 purpose that cater for different use cases to deterministically derive key pairs from the seed.

## Exodus Purpose Field

Exodus has its own [bip43] purpose field for internal use.

This module exports this purpose value as the number `6649967`, which is equivalent to the UTF-8 encoded text `exo`.

## Documented Usage Paths

The [bip32] paths currently used are listed here along with their descriptions. `'` denotes hardened derivation. Note that hardened derivation is always used for the Exodus Purpose.

| Path           | Usage                                                                                    |
| -------------- | ---------------------------------------------------------------------------------------- |
| `m/EXO'/1'/0`  | Wallet info file deterministic encryption key                                            |
| `m/EXO'/1'/1`  | Public key is used for backing up the info file                                          |
| `m/EXO'/2'/0'` | Keypair used for e2e libsodium ed25519 keys                                              |
| `m/EXO'/2'/2'` | Deprecate, do not re-use this path for anything                                          |
| `m/EXO'/2'/3'` | Keypair used to binauth with telemetry server                                            |
| `m/EXO'/3'/0'` | Keys used to sign mesages for the Wallet of Satoshi APIs                                 |
| `m/EXO'/4'/1'` | Used for signing & encrypting messages w.r.t username client                             |
| `m/EXO'/5'/n'` | The last number `n` is reserved for seedless project, `0` is used for seedless backup id |
| `m/EXO'/6'/0'` | Key used to derive auth key for fiat server                                              |
| `m/EXO'/7'/0'` | Encryption key for encrypting extra seeds in a multi-seed wallet                         |

[bip43]: https://github.com/bitcoin/bips/blob/master/bip-0043.mediawiki
[bip32]: https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki

Jan 15 2019 - Konnor Klashinsky:

- Moved the `EXODUS_PURPOSE` constant from `#/exodus-purpose` to `#/bip43-purpose` so the module can be used for other BIP43 purpose constants like SegWit.

Feb 24 2019 - Konnor Klashinsky:

- Added the `SEGWIT_NESTED_PURPOSE` constants for P2WPKH-nested-in-P2SH, used for hardware wallets

Mar 1 2019 - Konnor Klashinsky

- Added the `HD_WALLET_PURPOSE` constants for BIP44 HD wallets.

July 3 2019 - Max Ogden

- Added 1 path used for libsodium ed25519 derivation using SLIP-0010 in the e2e syncing implementation.

July 4 2019 - Konnor Klashinsky:

- Moved `#/bip43-purpose` to `#/constants/bip43`.

Dec 17, 2019 - Mark Vayngrib:

- Added `m/EXO'/2'/1'` path used to derive mnemonic encryption key in 2fa mode (encrypts mnemonic stored on mobile)

Dec 31, 2019 - Mark Vayngrib:

- Added `m/EXO'/2'/2'` path used to derive encryption key for `twofactor.seco`

Jan 28, 2020 - Mark Vayngrib:

- Removed `m/EXO'/2'/2'` path used to derive encryption key for `twofactor.seco`, will use randombytes instead

Feb 7, 2020 - Mark Vayngrib:

- Removed `m/EXO'/0'/0` path used to derive the no longer used Exchange EID

Jul 12 2021 - Vlad Stan

- Added `m/EXO'/3'/0'` path used to derive the keys used to sign messages for the Wallet of Satoshi REST APIs.
- Each account will derive a path according to its index: `m/EXO'/3'/0'/0'`, `m/EXO'/3'/0'/1'`, etc

May 02 2022 - Florian Mathieu

- Added `m/EXO'/2'/2'` path as deprecated to prevent re-use in the future
- Added `m/EXO'/2'/3'` path as keypair for telemetry binauth

Mar 23, 2023 - Guten Ye

- Added `m/EXO'/5'/n'` path used for seedless project

Nov 13, 2023 - Diego Muracciole

- Remove unused `m/EXO'/2'/1'` path used for 2fa mnemonic encryption

February 28th, 2024 - Mark Vayngrib

- Added `m/EXO'/6'/0'` path for key used to derive auth key for fiat server
- Added `m/EXO'/7'/0'` path used for deriving the encryption key used for encrypting extra seeds in a multi-seed wallet
