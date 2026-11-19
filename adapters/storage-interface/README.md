# `@exodus/storage-interface`

Typings for the most common storage interface used in Exodus wallet, as described in [storage-spec](../storage-spec/spec.md)

## Usage

In your storage implementation:

```ts
import { Storage } from '@exodus/storage-interface'

class BlockchainStorage implements Storage {
  // ...
}
```
