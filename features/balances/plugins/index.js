import createBalancesAnalyticsPlugin from './analytics.js'
import createBalancesLifecyclePlugin from './lifecycle.js'

export const balancesLifecyclePluginDefinition = {
  id: 'balancesLifecyclePlugin',
  type: 'plugin',
  factory: createBalancesLifecyclePlugin,
  dependencies: ['balancesAtom', 'port', 'balances', 'hasBalanceAtom'],
  public: true,
}

export const balancesAnalyticsPluginDefinition = {
  id: 'balancesAnalyticsPlugin',
  type: 'plugin',
  factory: createBalancesAnalyticsPlugin,
  dependencies: [
    'analytics',
    'hasBalanceAtom',
    'assetsWithBalanceCountAtom',
    'assetsTotalWalletAmountsAtom',
    'config?',
  ],
  public: true,
}
