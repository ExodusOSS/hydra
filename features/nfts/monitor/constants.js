import ms from 'ms'

export const MONITOR_SLOW_INTERVAL = ms('5m')
export const MONITOR_MINIMUM_INTERVAL = ms('10s')
export const DEFAULT_EMPTY_NFTS_INTERVAL_MULTIPLIER = 3
export const DEFAULT_EMPTY_TXS_INTERVAL_MULTIPLIER = 3
export const BATCH_MAX_ADDRESSES = 20
export const BATCH_FETCH_NO_TXS_INTERVAL = ms('2h') // periodically fetch NFTs even without new TXs
export const BATCH_TRANSACTION_LOOKBACK_PERIOD = ms('3d') // amount of time for checking existing txs in case a tx was updated or removed (for example categorized as spam)
