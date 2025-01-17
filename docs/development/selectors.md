# Selectors

A selector is a small function we write that can take the entire Redux state, pick a value from it and possibly transform it. We can also combine existing selectors to form new ones, allowing us to efficiently reuse already computed data. This allows us to manage the data flow and compute various properties without the need of storing the computations into the app state.

By subscribing selectors to state changes we can continuously re-compute our desired values which allows us to keep the data accurate at all times.

## Performance

We hit performance bottlenecks with some selectors (or their usage). E.g. on mobile we needed to refactor a few selector chains to keep the app running smoothly.

**A general guideline would be to subscribe the selector to the smallest possible state that will allow it to compute the outcome**. Especially when these selectors are connected to UI components, causing UI to re-render on every change - this can lead to huge perf losses even when the actual selector computation is cheap. There are lots of cases where this is not feasible or needed, but it is a good rule of thumb.

To give a concrete example for the above, let's say we want to get txs for an asset. One way you could write the selector that does that is:

```js
const exampleState = {
  txs: {
    bitcoin: bitcoinTxArray,
    monero: moneroTxArray,
  },
}

const getAssetTxs = createSelector(
  (state) => state.txs,
  (txs) => (assetName) => txs[assetName]
)
```

To get monero txs we would simply call `getAssetTxs(exampleState)('monero')`.

This is perfectly valid, easy to read code. But it can lead to perf issues where the selector is connected to the UI because `getAssetTxsSelector` will return a new function (ref) every time the `txs` state changes. For example if we are viewing Monero transactions on the history screen the selector will return a new function and the UI will re-render every time a new bitcoin transaction is added. Even though we are only looking at Monero transactions. This effect is further increased if the above selector is used as an input for another selector, causing a chain of computes/re-renders that might be completely unnecessary.

A more performant way to write the above would be to have a selector for each asset:

```js
const exampleState = {
  txs: {
    bitcoin: bitcoinTxArray,
    monero: moneroTxArray,
  },
}

const getAssetTxs = memoize((assetName) =>
  createSelector(
    (state) => state.txs[assetName],
    (txs) => txs
  )
)
```

To get monero txs you now call `getAssetTxs('monero')(exampleState)`. This only returns a new value when monero txs change, significantly reducing the number of re-computes/re-renders.

**As a rule of thumb if you are not sure which way to go it is best to go the selector factory route.**
