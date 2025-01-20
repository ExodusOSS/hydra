const balanceFieldsConfig = [
  { name: 'total', legacyName: 'balance', default: 'zero' },
  { name: 'spendable', legacyName: 'spendableBalance', default: 'total' },
  { name: 'unconfirmedSent' },
  { name: 'unconfirmedReceived' },
  { name: 'unspendable' },
  { name: 'walletReserve' },
  { name: 'networkReserve' },
  { name: 'staking' },
  { name: 'staked' },
  { name: 'stakeable' },
  { name: 'unstaking' },
  { name: 'unstaked' },
  { name: 'rewards' },
  { name: 'frozen' },
]

const config = {
  balanceFieldsConfig,
  balanceFields: balanceFieldsConfig
    .flatMap((fieldConfig) => [fieldConfig.name, fieldConfig.legacyName])
    .filter(Boolean), // wallets can reduce the number of exposed fields,
  assetsToTrackForBalances: [],
}

export default config
