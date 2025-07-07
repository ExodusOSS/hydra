# @exodus/hardware-wallets

This feature is a high level abstraction for interacting with hardware wallet devices.

|       Feature        | Supported |
| :------------------: | :-------: |
| Syncing Public Keys  |    ✅     |
| Signing Transactions |    ✅     |
|   Signing Messages   |    ✅     |
| Firmware Management  |    ❌     |

## Device Support Matrix

| Manufacturer | Device Model | Supported |
| :----------: | :----------: | :-------: |
|    Ledger    |    Nano S    |    ✅     |
|    Ledger    |   Nano S+    |    ✅     |
|    Ledger    |    Nano X    |    ✅     |
|    Ledger    |     Stax     |    ✅     |
|    Trezor    |     One      |    ❌     |
|    Trezor    |      T       |    ❌     |
|    Trezor    |    Safe 3    |    ❌     |
|    Trezor    |    Safe 5    |    ❌     |

## Usage

### With IoC

```typescript
import hardwareWallets from '@exodus/hardware-wallets'

ioc.use(hardwareWallets())
```

## Architecture

### Terminology

A bit of terminology might be required to properly understand the distinctions between the various "states" of an asset.

- **supported** assets: All assets supported by our implementation for the device.
- **installed** assets: All assets supported by our implementation AND installed on the device by the user.
- **useable** assets: All assets supported by our implementation, installed on the device AND opened on the device (ledger).
- **synced** assets: All assets for which the public keys have been synced to the wallet account fusion channel.

### `scan({ assetName, accountIndexes, addressLimit, addressOffset })`

The `scan` functions is used during onboarding to retrieve the addresses (n=2) starting at `addressOffset` for each account index in `accountIndexes` from the hardware wallet device. It retrieves the corresponding balance using an network API call. Calling this function does not make any permanent state changes and all its state is ephemeral. This function serves to allow the user to "scan" the accounts, their addresses and balances without having to commit to an account index & syncing it completely yet.

> [!CAUTION]
> This function must only be used during onboarding of a hardware wallet device.

```mermaid
sequenceDiagram
    Consumer->>+HardwareWallets: scan({ assetName, accountIndexes, addressOffset })
    HardwareWallets->>+HardwareWalletDevice: getAddress({ assetName, derivationPath })
    HardwareWalletDevice-->>-HardwareWallets: address0
    HardwareWallets->>+HardwareWalletDevice: getAddress({ assetName, derivationPath })
    HardwareWalletDevice-->>-HardwareWallets: address1
    HardwareWallets->>+Asset: api.getBalanceForAddress(address0)
    Asset-->>-HardwareWallets: balance0
    HardwareWallets->>+Asset: api.getBalanceForAddress(address1)
    Asset-->>-HardwareWallets: balance1
    HardwareWallets-->>-Consumer: First N addresses with balance <br> for given account indexes

```

### `sync({ accountIndex })`

Synchronizes public keys (XPUBs / public keys) for all useable assets for a given `accountIndex` from a hardware wallet device and stores them temporarily for future use. The hardware wallet device may disconnect after this method has been called and onboarding would still be possible.

> [!CAUTION]
> Only a subset of the supported assets may be synced. Some hardware wallet devices like Ledger do not support multiple assets at the same time because the asset-specific application must be installed and opened on the device.

```mermaid
sequenceDiagram
    participant Consumer
    participant HardwareWallets
    participant Device
    participant BaseAsset

    Consumer->>HardwareWallets: sync({ accountIndex })
    activate HardwareWallets

    HardwareWallets->>Device: listUseableAssetNames()
    activate Device
    Device-->>HardwareWallets: [assetName0, assetName1, ...]
    deactivate Device

    loop for each assetName
        HardwareWallets->>BaseAsset: getSupportedPurposes({ compatibilityMode: 'ledger' })
        activate BaseAsset
        BaseAsset-->>HardwareWallets: [purpose0, purpose1, ...]
        deactivate BaseAsset

        loop for each purpose
            alt getXPub is supported
                HardwareWallets->>Device: getXPub({ assetName, derivationPath })
                activate Device
                Device-->>HardwareWallets: xpub
                deactivate Device
                HardwareWallets->>HardwareWallets: Store keyIdentifier and xpub
            else getPublicKey instead
                HardwareWallets->>Device: getPublicKey({ assetName, derivationPath })
                activate Device
                Device-->>HardwareWallets: publicKey
                deactivate Device
                HardwareWallets->>HardwareWallets: Store keyIdentifier and publicKey
            end
        end
    end

    HardwareWallets->>HardwareWallets: Generate random ID
    HardwareWallets->>HardwareWallets: Store keys in syncedKeysMap with ID

    HardwareWallets-->>Consumer: SyncedKeysId
    deactivate HardwareWallets

```

### `addPublicKeysToWalletAccount({ walletAccount, syncedKeysId })`

Adds public keys (XPUBS / public keys) to an existing wallet account.

- Moves the synchronized public keys (XPUBs / public keys) for `syncedKeysId` identifier from the temporary in-memory objectmap to a `walletAccounts`'s public key store which will store it in fusion.
- Start a restore procedure for the assets & trigger a refresh of the `txLogMonitor`

```mermaid
sequenceDiagram
    participant Consumer
    participant HardwareWallets
    participant PublicKeyStore
    participant RestoreProgressTracker
    participant TxLogMonitors

    Consumer->>HardwareWallets: addPublicKeysToWalletAccount({ walletAccount, syncedKeysId })
    activate HardwareWallets

    HardwareWallets->>HardwareWallets: Retrieve keys from syncedKeysMap using syncedKeysId
    Note right of HardwareWallets: Retrieves assetNames and keysToSync

    loop for each key in keysToSync
        HardwareWallets->>PublicKeyStore: add({ walletAccount, keyIdentifier, xpub, publicKey })

    end

    loop for each assetName in assetNames
        HardwareWallets->>RestoreProgressTracker: restoreAsset(assetName)
        HardwareWallets->>TxLogMonitors: update({ assetName, refresh: true })
    end

    deactivate HardwareWallets
    HardwareWallets-->>Consumer: void
```

### `create({ syncedKeysId })`

Creates a new hardware wallet account and calls `addPublicKeysToWalletAccount()` to synchronize public keys to the newly created wallet account.
