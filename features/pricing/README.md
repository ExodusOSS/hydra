# @exodus/pricing

This feature expose API to fetch asset prices and other market data.

## Usage

This feature is designed to be used together with `@exodus/headless`. See [Using the SDK](../../docs/development/using-the-sdk.md) for more details.
By default, it uses remote config to get exodus server url, but you can override it via config:

```
pricing({
    pricingServerPath: 'infrastructure.price-server.server', // path to remove config prop
    defaultPricingServerUrl: 'https://pricing-s.a.exodus.io', // if remote config not available
  })
```

### API Side

`exodus.pricing.currentPrice`
`exodus.pricing.ticker`
`exodus.pricing.realTimePrice`
... see api [types](./api/index.d.ts)

### Play with it

1. Open the playground at https://exodus-hydra.pages.dev/features/pricing
