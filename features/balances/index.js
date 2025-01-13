import balancesDefinition from './module/index.js'
import {
  balancesAtomDefinition,
  hasBalanceAtomDefinition,
  fundedWalletAccountsAtomDefinition,
  assetsWithBalanceCountAtomDefinition,
  assetNamesWithBalanceAtomDefinition,
  assetsTotalWalletAmountsDefinition,
} from './atoms/index.js'
import balancesReportDefinition from './report/index.js'
import {
  balancesLifecyclePluginDefinition,
  balancesAnalyticsPluginDefinition,
} from './plugins/index.js'
import typeforce from '@exodus/typeforce'
import defaultConfig from './default-config.js'

const balances = (walletConfig) => {
  const config = {
    ...defaultConfig,
    balanceFields: walletConfig?.balanceFields || defaultConfig.balanceFields,
    assetsToTrackForBalances:
      walletConfig?.assetsToTrackForBalances || defaultConfig.assetsToTrackForBalances,
  }
  typeforce(
    {
      balanceFields: typeforce.arrayOf('String'),
      balanceFieldsConfig: typeforce.arrayOf('Object'),
      assetsToTrackForBalances: typeforce.arrayOf('Object'),
    },
    config,
    true
  )

  return {
    id: 'balances',
    definitions: [
      {
        definition: balancesDefinition,
        config,
      },
      { definition: balancesAtomDefinition },
      { definition: assetNamesWithBalanceAtomDefinition },
      { definition: assetsWithBalanceCountAtomDefinition },
      {
        definition: hasBalanceAtomDefinition,
        storage: { namespace: 'balances' },
        aliases: [{ implementationId: 'unsafeStorage', interfaceId: 'storage' }],
      },
      { definition: fundedWalletAccountsAtomDefinition },
      { definition: balancesReportDefinition },
      { definition: balancesLifecyclePluginDefinition },
      { definition: assetsTotalWalletAmountsDefinition },
      {
        if: { registered: ['analytics'] },
        definition: balancesAnalyticsPluginDefinition,
        config: { assetsToTrackForBalances: config.assetsToTrackForBalances },
      },
    ],
  }
}

export default balances
