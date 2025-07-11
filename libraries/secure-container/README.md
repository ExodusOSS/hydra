# secure-container

## Install

```sh
npm i --save secure-container
```

## API

### Main Module

This is the main module most users should use; other modules are for advanced users only.

```js
import * as seco from 'secure-container'
```

#### `async seco.encrypt(data, options)`

- `data` (String | Buffer) Data to encrypt
- `options` (Object)
  - `header` (Object)
    - `appName` (String) Name of your app
    - `appVersion` (String) Version of your app
  - `passphrase` (String | Buffer) Passphrase used to encrypt the data
  - `metadata` (Object)
  - `blobKey` (Buffer)

_Note:_ Must set either `passphrase` or `metadata` & `blobKey`.

Returns an Object that contains:

- `encryptedData` (Buffer) The encrypted data
- `blobKey` (Buffer)
- `metadata` (Object)

#### `async seco.decrypt(encryptedData, passphrase)`

- `encryptedData` (Buffer) Data to decrypt
- `passphrase` (String | Buffer) Passphrase to decrypt the data

Returns an Object that contains:

- `data` (Buffer) The file data
- `header` (Object) The header for the secure-container
- `blobKey` (Buffer)
- `metadata` (Object)

### `header` module

```js
import { header } from 'secure-container'
```

#### `header.create(data)`

Create a header object.

- `data` (Object)
  - `appName` (String) Name of your app
  - `appVersion` (String) Version of your app

Returns an Object.

#### `header.serialize(headerObj)`

Serialize a header object. `headerObj` is a header object made with `create()`. Returns a Buffer.

#### `header.decode(buffer)`

Decodes a header buffer and returns the Object.

### `metadata` module

```js
import { metadata } from 'secure-container'
```

#### `metadata.create()`

Create a metadata object. Returns an Object.

#### `async metadata.encryptBlobKey(metadata, passphrase, blobKey)`

- `metadata` (Object) Metadata created with `metadata.create()`.
- `passphrase` (String | Buffer)
- `blobKey` (Buffer)

Mutates `metadata` object; returns `undefined`.

#### `metadata.serialize(metadata)`

Serialize a metadata object. Returns a Buffer.

#### `metadata.decode(buffer)`

Takes a metadata buffer, decodes it, and returns an object.

#### `async metadata.decryptBlobKey(metadata, passphrase)`

- `metadata` (Object) Metadata with an encrypted blobKey.
- `passphrase` (String | Buffer)

Returns `blobKey` as a buffer.

### `blob` module

```js
import { blob } from 'secure-container'
```

#### `async blob.encrypt(data, metadata, blobKey)`

- `data` (Buffer) Data or message to encrypt.
- `metadata` (Object) Metadata object.
- `blobKey` (Buffer)

Mutates `metadata`. Returns an object:

- `blob` (Buffer) Encrypted data.
- `blobKey` (Buffer) The `blobKey` you passed in.

#### `async blob.decrypt(blob, metadata, blobKey)`

- `blob` (Buffer) Encrypted data.
- `metadata` (Object) Metadata object.
- `blobKey` (Buffer)

Returns the decrypted data as a buffer.

### `file` module

```js
import { file } from 'secure-container'
```

#### `async file.computeChecksum(metadata, blob)`

- `metadata` (Buffer) Metadata as a Buffer
- `blob` (Buffer) Encrypted blob

Returns a `sha256` checksum as a buffer.

#### `file.encode(fileObj)`

- `fileObj` (Object)
  - `header` (Buffer) Serialized header
  - `checksum` (Buffer) Checksum from `file.computeChecksum()`
  - `metadata` (Buffer) Metadata as a Buffer
  - `blob` (Buffer) Encrypted blob

Returns a buffer.

#### `file.decode(fileBuffer)`

The opposite of `file.encode()`. Takes a buffer and returns an object.

#### `async file.checkContents(fileBuffer)`

Performs `.decode()` and checks that the checksum matches.

Return a boolean, `true` if checksum matched, `false` if not.

## File Format Description

This is the documentation for the binary structure of secure containers.

For clarity, we have split the documentation into four sections: `header`, `checksum`, `metadata`, and `blob`.

### Header

| Size               | Label              | Description                                               |
| ------------------ | ------------------ | --------------------------------------------------------- |
| 4                  | `magic`            | The magic header indicating the file type. Always `SECO`. |
| 4                  | `version`          | File format version. Currently `0`, stored as `UInt32BE`. |
| 4                  | `reserved`         | Reserved for future use.                                  |
| 1                  | `versionTagLength` | Length of `versionTag` as `UInt8`.                        |
| `versionTagLength` | `versionTag`       | Should be `'seco-v0-scrypt-aes'`.                         |
| 1                  | `appNameLength`    | Length of `appName` as `UInt8`.                           |
| `appNameLength`    | `appName`          | Name of the application writing the file.                 |
| 1                  | `appVersionLength` | Length of `appVersion` as `UInt8`.                        |
| `appVersionLength` | `appVersion`       | Version of the application writing the file.              |

### Checksum

32-byte `sha256` checksum of the following data:

1. The `metadata`.
1. Byte-length of the `blob`, stored as `UInt32BE`.
1. The `blob`.

### Metadata

| Size | Label     | Description                                                   |
| ---- | --------- | ------------------------------------------------------------- |
| 32   | `salt`    | Scrypt salt.                                                  |
| 4    | `n`       | Scrypt `n` parameter.                                         |
| 4    | `r`       | Scrypt `r` parameter.                                         |
| 4    | `p`       | Scrypt `p` parameter.                                         |
| 32   | `cipher`  | Currently `aes-256-gcm` stored as a zero-terminated C-string. |
| 12   | `iv`      | `blobKey`'s `iv`.                                             |
| 16   | `authTag` | `blobKey`'s `authTag`.                                        |
| 32   | `key`     | `blobKey`'s `key`.                                            |
| 12   | `iv`      | The `blob`'s `iv`.                                            |
| 16   | `authTag` | The `blob`'s `authTag`.                                       |

### Blob

| Size         | Label        | Description                     |
| ------------ | ------------ | ------------------------------- |
| 4            | `blobLength` | Length of `blob` as `UInt32BE`. |
| `blobLength` | `blob`       | Encrypted data.                 |
