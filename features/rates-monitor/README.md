# @exodus/rates-monitors

This feature fetches pricing data (via pricingClient) for assets.

Data is fetched automatically on startup for currency defined in `currencyAtom` and assets from `availableAssetNamesAtom`. data is stored in `ratesAtom`.

Pricing data contains: `price` - current price in requested currency, `priceUSD` - current USD price, `change24` - percentage change for 24 hours, `volume24` - volume in requested currency, `cap` - market cap of asset, `invalid` - boolean indicates that data is corrupted

## Usage

This feature is designed to be used together with `@exodus/headless`. See [Using the SDK](../../docs/development/using-the-sdk.md) for more details.

### API Side

- `exodus.rates.refresh()` re-fetches monitored pricing data.
- `exodus.rates.fetchTickers(tickers)` immediately fetches installed or temporary tickers.
  Uninstalled tickers remain monitored for five minutes, and another call renews that period.
  Installing the asset transfers ownership without dropping its cached price. Empty input and calls
  while stopped are no-ops; a failed explicit fetch rejects without clearing existing rates.

### Play with it

1. Open the playground at https://exodus-hydra.pages.dev/features/rates-monitor
2. Check that the data selector returns prices in USD
3. Check that public API available `exodus.rates.refresh()`
