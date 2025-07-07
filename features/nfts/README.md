# @exodus/nfts

This monitor fetches NFTs related data transaction information, for each supported network (if it has nfts support and nfts-proxy supports fetching transaction history by address).

## Usage

```js
nftsMonitor.on('nfts', (data) => port.emit('nfts', data))
nftsMonitor.on('nftsTxs', (data) => port.emit('nftsTxs', data))
```

## Monitor config

### config.networkIntervalMultipliers (optional)

Interval multiplier for specific networks, for example pass `{ fantom: 2 }` so that the fantom monitor interval is 2X longer

### config.emptyTxsIntervalMultiplier (defaults to 3)

Interval multiplier for Addresses without txs (from txLog), does NOT apply to short intervals (less than 1 minute)

### config.emptyNftsIntervalMultiplier (defaults to 3)

Interval multiplier for Addresses without NFTs, does NOT apply to short intervals.

example: background interval is set to 5 minutes, a specific solana address has txs in txLog but no NFTs, the fetch for that address will happen every 15 minutes instead of 5.
