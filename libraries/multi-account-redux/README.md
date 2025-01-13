## `@exodus/multi-account-redux`

Selectors and utilities for managing state with the following shape:

```js
{
  state[sliceName] = {
    exodus_0: {
      error: null,
      loaded: true,
      data: {
        bitcoin: {}, // TxSet/UtxoCollection/etc.
      },
    },
  }
}
```
