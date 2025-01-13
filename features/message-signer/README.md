# @exodus/message-signer

The message signer delegates the unsigned message to the corresponding (software or hardware) wallet.

## Usage

```typescript
const seedBasedMessageSigner = seedBasedMessageSignerDefinition.factory({
  assetsModule,
  keychain,
  addressProvider,
})

const messageSigner = messageSignerDefinition.factory({
  seedBasedMessageSigner,
  hardwareWallets,
})

const signedMessage = await messageSigner.signMessage({
  baseAssetName,
  walletAccount,
  message,
})
```
