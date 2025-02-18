import fiatCurrencies from '@exodus/fiat-currencies'

const { USD } = fiatCurrencies

export const defaultNonDustAssetsConfig = {
  balanceThresholdsUsd: Object.create(null),
  defaultBalanceThresholdUsd: USD.defaultUnit(0.5),
  balanceThresholdByChainUsd: Object.create(null),
}

export const defaultConfig = {
  optimistic: false,
  nonDustAssets: Object.create(null),
  balanceFields: ['balance'],
  assetsToTrackForBalances: [],
}
