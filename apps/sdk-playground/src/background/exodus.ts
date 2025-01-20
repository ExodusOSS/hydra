import createHeadless from '@exodus/headless'
import abTesting from '@exodus/ab-testing'
import exchange from '@exodus/exchange'
import fiatBalances from '@exodus/fiat-balances'
import fiatRateConverter from '@exodus/fiat-rate-converter'
import favoriteAssets from '@exodus/favorite-assets'
import fusionLocal from '@exodus/fusion-local'
import syncTime from '@exodus/sync-time'
import fees from '@exodus/fees'
import marketHistory from '@exodus/market-history'
import orders from '@exodus/orders'
import activity from '@exodus/activity-txs'
import personalNotes from '@exodus/personal-notes'
import restoreTime from '@exodus/restore-time'
import analytics from '@exodus/analytics'
import announcements from '@exodus/announcements'
import eventLog from '@exodus/event-log'
import exportTransactions from '@exodus/export-transactions'
import postRestoreModal from '@exodus/post-restore-modal'
import apyRates from '@exodus/apy-rates'
import optimisticBalances from '@exodus/optimistic-balances'
import syncedBalances from '@exodus/synced-balances'
import localSeedBackups from '@exodus/local-seed-backups'
import profile from '@exodus/profile'

import transactions from './features/transactions/index.js'

const exodus = ({ adapters, config, debug }) => {
  const ioc = createHeadless({ adapters, config, debug })
    .use(exchange(config.exchange))
    .use(abTesting())
    .use(transactions())
    .use(analytics(config.analytics))
    .use(announcements())
    .use(restoreTime())
    .use(fees())
    .use(exportTransactions())
    .use(profile())

  // don't chain these above unless they get typed, otherwise inference breaks
  ioc
    .use(orders(config.orders))
    .use(fusionLocal())
    .use(syncTime())
    .use(favoriteAssets())
    .use(fiatBalances({ optimistic: false }))
    .use(fiatRateConverter())
    .use(marketHistory(config.marketHistory))
    .use(activity())
    .use(personalNotes())
    .use(eventLog())
    .use(apyRates())
    .use(optimisticBalances({ enabled: true }))
    .use(syncedBalances())
    .use(localSeedBackups())

  ioc.register({
    definition: {
      id: 'validateAnalyticsEvent',
      type: 'module',
      factory: () => () => {},
      public: true,
    },
  })
  ioc.use(postRestoreModal())

  return ioc.resolve()
}

export default exodus
