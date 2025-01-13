# @exodus/tx-simulator

This feature allows you to simulate transactions and get what the account would look like after broadcasting the tx.

## Usage

- `simulate`: allows you to simulate a transaction. The tx depends on the assetName:
  - `solana`: simulates a solana transaction.
  - `ethereum` (or any EVM base asset name): simulates an EVM transaction.
