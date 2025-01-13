# Price API

Util to fetch, validate and cache prices from server

## Table of Contents

- [Installation](#Installation)
- [Quick Start](#quick-start)

## Installation

`yarn add @exodus/price-api`

## Quick start

Module contains following useful utils:

### `fetchHistoricalPrices`

Based on provided arguments prepares params for request to exodus pricing server.
Depending on runtime cache and client long-term cache decides how much data needs to be fetched.
Validates data and prepares result to defined data structure.

#### Arguments

prices cache example: `[1502496000000, {close: 44}], [1502582400000, {close: 12}] ]`

| Name                 | Type       | Description                                                                                      | Optional | Returns      |
|----------------------|------------|--------------------------------------------------------------------------------------------------|----------|--------------|
| api                  | _Function_ | Function to make request to pricing server                                                       |          | Promise      |
| assetTickers         | _Array_    | Array of asset tickers to fetch                                                                  |          |              |
| fiatTicker           | _String_   | fiat currency supported by Exodus, as well as BTC                                                |          |              |
| granularity          | _String_   | Granularity of the historical data, values must be day or hour                                   |          |              |
| getCacheFromStorage  | _Function_ | accepts tickerSymbol and returns array historical prices                                         |          | prices cache |
| hourlyLimit          | _Number_   | limits historical hourly prices to fetch. default=168                                            | true     |              |
| timestamp            | _Number_   | milliseconds since Unix Epoch to fetch price exact on this date                                  | true     |              |
| getCurrentTime       | _Function_ | returns milliseconds since Unix Epoch                                                            | true     | milliseconds |
| ignoreInvalidSymbols | _Bool_     | ignore error when fetch prices for unsupported assets. Empty Map will be returned for this asset | true     |              |
| ignoreCache          | _Bool_     | refetch the entire price history, ignoring existent cached values                                | true     |              |
| runtimeCache         | _Map_      | storage for runtime cache                                                                        | true     |              |
| getRuntimeCacheKey   | _Function_ | get key to access runtime cache                                                                  | true     |              |

#### Returns

Object with Maps with prices Maps by asset ticker. prices Map keyed by timestamp in milliseconds.
historicalPricesMap includes prices from cache
fetchedPricesMap includes only assets fetched from server. If asset had cache but new prices fetched from server this Map includes combined data
```
{
  historicalPricesMap: new Map([
 ['ZRX', new Map([ [1502496000000, {close: 44}], [1502582400000, {close: 12}] ])],
 ['BTC', new Map([ [1502496000000, {close: 10000}], [1502582400000, {close: 50000}] ])],
]),
  fetchedPricesMap: new Map([
 ['ZRX', new Map([ [1502496000000, {close: 44}], [1502582400000, {close: 12}] ])],
 ['BTC', new Map([ [1502496000000, {close: 10000}], [1502582400000, {close: 50000}] ])],
])
}
```

### `fetchPricesInterval`

Setup interval to fetch prices. Daily prices updated on UTC day start, hourly every UTC and local hour start.

#### Arguments

| Name           | Type       | Description                                                            | Optional |
|----------------|------------|------------------------------------------------------------------------|----------|
| func           | _Function_ | Function to make fetch prices                                          |          |
| granularity    | _Array_    | Granularity of the historical data, values must be day or hour         |          |
| getJitter      | _Function_ | Function that returns jitter (ms) to create delay in [0, jitter] range | true     |
| delay          | _Number_   | delay in milliseconds                                                  | true     |
| getCurrentTime | _Function_ | returns milliseconds since Unix Epoch                                  | true     |
