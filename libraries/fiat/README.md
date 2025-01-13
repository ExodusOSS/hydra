# Exodus Units

[![npm][npm-image]][npm-url]
[npm-image]: https://img.shields.io/npm/v/@exodus/fiat.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/@exodus/fiat

This package provides the units (fiat currency) support for
**pricing server**. It is intended to also be used in other projects
that Exodus provides, but we are starting here first.

## Install

yarn add @exodus/units

## Usage

```js
const units = require('units')

console.log(units)
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

console.log(Object.keys(units))
// Sample output:
//
// ['AUD', 'BRL', 'CAD', 'CHF', ... ]
```
