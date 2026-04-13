# @exodus/fiat

Fiat currency metadata. You should probably consume this through the [@exodus/fiat-currencies](../fiat-currencies) package, which exports [@exodus/currency](../currency) instances for each fiat currency and enables you do unit-aware financial calculations safely.

## Install

yarn add @exodus/fiat

## Usage

```js
const fiatCurrencies = require('@exodus/fiat')

console.log(fiatCurrencies)
// Sample output:
//
//  ...
//  "TRY": {
//    "label": "TRY - Turkish lira",
//    "symbol": "₺"
//  },
//  "TWD": {
//    "label": "TWD - New Taiwan dollar",
//    "symbol": "$"
//  },
//  "USD": {
//    "label": "USD - United States dollar",
//    "symbol": "$"
//  },
//  ...

console.log(Object.keys(fiatCurrencies))
// Sample output:
//
// ['AUD', 'BRL', 'CAD', 'CHF', ... ]
```
