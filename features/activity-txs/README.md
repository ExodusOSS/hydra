# @exodus/activity-txs

This feature generates user-friendly activity from transactions, orders, fiat orders, NFTs, and connections by grouping, batching, and formatting them.

## How it works

Each asset’s activity consists of a set of transactions transformed using `asset.api.getActivityTxs`, which returns an array of Tx [models](https://github.com/ExodusMovement/exodus-core/blob/cdff25bb962b2301613588c615c5ac09b05f260a/packages/models/src/tx/index.js#L10): `[Tx, Tx, Tx]`.

**Most assets don't have this API and simply return the original transactions.**

For example, Bitcoin batched transactions are combined into a single activity item. Instead of multiple transactions (Txs), you get a single transaction with a summarized `coinAmount`.

This feature introduces atoms with activity items generated from `txLog` and `accountState`. It provides an efficient way to store these items by wallet accounts and update this extensive object while avoiding unnecessary re-computations.

Additionally, it offers extra Redux selectors to retrieve activity, limited by size or batched activity items. These selectors format activity depending on its type: NFTs (if the `nfts` module is integrated), fiat orders (if the fiat module is integrated), and swap orders (if the orders feature is integrated).

## Usage

This feature is designed to be used together with `@exodus/headless`. See [Using the SDK](../../docs/development/using-the-sdk.md) for more details.

### API Side

The feature doesn't have a public API. Data is transformed automatically, stored in `activityTxsAtom`, and emitted to be stored in the Redux state.

### Play with it

1. Open the playground at https://exodus-hydra.pages.dev/features/activity-txs
2. Run the following command in the Dev Tools Console to see activity for Bitcoin:

   ```js
   selectors.activityTxs.createFullActivity({
     nftsNetworkNameToAssetName: { fantom: 'fantommainnet' },
   })({ assetName: 'bitcoin', walletAccount: 'exodus_0' })(store.getState())
   ```

3. run the following command in the Dev Tools Console to see activity for Bitcoin and Ethereum together:

```js
selectors.activityTxs.createMultiActivity({
  createAssetSourceActivitySelector: selectors.activityTxs.createFullActivity({
    nftsNetworkNameToAssetName: { fantom: 'fantommainnet' },
  }),
})({ assetNames: ['bitcoin', 'ethereum'], walletAccounts: ['exodus_0', 'exodus_1'] })(
  store.getState()
)
```

4. Try out some other selectors from `selectors.activityTxs`. See example usage in [tests](./redux/__tests__/selectors/).

### UI Side

See [using the sdk](../../docs/development/using-the-sdk.md#events) for more details on basic UI-side setup.

```js
import selectors from '~/ui/flux/selectors'

const fullAssetSourceActivitySelector = selectors.activityTxs.createFullActivity({
  nftsNetworkNameToAssetName: { fantom: 'fantommainnet' },
})

const MyComponent = () => {
  const bitcoinActivity = useSelector(
    fullAssetSourceActivitySelector({ assetName: 'bitcoin', walletAccount: 'exodus_0' })
  )

  return bitcoinActivity.map((activityItem) => (
    <Text>
      {activityItem.assetName} : {activityItem.displayAmount}
    </Text>
  ))
}
```
