# @exodus/fusion-atoms

Factory for creating atoms that sync using the fusion API (e.g. see [fusion-local](../../features/fusion-local)).

## Usage

```js
import { createFusionAtom } from '@exodus/fusion-atoms'

const fooBarAtom = createFusionAtom({ fusion, path: 'foo.bar', defaultValue: 42 })
// treat fooBarAtom like a normal atom
```
