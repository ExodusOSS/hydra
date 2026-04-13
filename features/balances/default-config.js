const balanceFieldsConfig = [
  { name: 'total', legacyName: 'balance', default: 'zero' },
  { name: 'spendable', legacyName: 'spendableBalance', default: 'total' },
  { name: 'unconfirmedSent', default: 'zero' },
  { name: 'unconfirmedReceived', default: 'zero' },
  { name: 'unspendable', default: 'zero' },
  { name: 'walletReserve', default: 'zero' },
  { name: 'networkReserve', default: 'zero' },
  { name: 'staking', default: 'zero' },
  { name: 'staked', default: 'zero' },
  { name: 'stakeable', default: 'zero' },
  { name: 'unstaking', default: 'zero' },
  { name: 'unstaked', default: 'zero' },
  { name: 'rewards', default: 'zero' },
  { name: 'frozen', default: 'zero' },
]

const config = {
  balanceFieldsConfig,
  balanceFields: balanceFieldsConfig
    .flatMap((fieldConfig) => [fieldConfig.name, fieldConfig.legacyName])
    .filter(Boolean), // wallets can reduce the number of exposed fields,
  assetsToTrackForBalances: [],
}

export default config
