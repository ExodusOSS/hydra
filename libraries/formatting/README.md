# @exodus/formatting

Utils for formatting numbers, strings, and money.

## Installation

```bash
yarn add @exodus/formatting
```

## Usage

See the test files for usage examples:

- [Numbers](./src/numbers.spec.ts) - `roundDecimalSignificantsUp`, `padDecimals`, `asOrdinal`. To round, pad, and format numbers
- [Strings](./src/strings.spec.ts) - `toCamelCase`, `toKebapCase`, `toPascalCase`, `truncate`, `pad`, etc. To transform and manipulate strings
- [Bytes](./src/bytes.spec.ts) - `formatBytes`. To format byte sizes into human-readable format
- [Currency](./src/format-currency.spec.ts) - `formatCurrency`. To format currency values with locale support
- [Currency Utils](./src/currency.spec.ts) - `formatNumber`, `getCurrencySymbol`. To get currency symbols and format numbers
- [Asset](./src/asset.spec.ts) - `formatAssetAmount`, `formatBalance`, `isDustAmount`. high level wrappers to format crypto asset-related numbers with pre-defined rules
- [Price](./src/price.spec.ts) - `formatPrice`, `formatPriceUSD`, `formatAssetPrice`. high level wrapper to format fiat prices with pre-defined rules
- [Percentage](./src/percentage.spec.ts) - `formatPercentage`. To format percentage values with optional plus signs

## License

MIT
