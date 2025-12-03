# @exodus/cached-sodium-encryptor

This feature offers sodium encryption but derives keys once. This is useful for encryption/decryption in features that operate regardless of lock such as fusion or storage encryption.

## Install

```sh
yarn add @exodus/cached-sodium-encryptor
```

## Usage

This feature is used inside `@exodus/headless` (see [using the sdk](../../docs/development/using-the-sdk.md))

## API

```ts
const encrypted = exodus.cachedSodiumEncryptor.encryptSecretBox({ keyId, seedId, data })
```
