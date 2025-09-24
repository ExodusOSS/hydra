import abTesting from '@exodus/ab-testing/redux'
import assetSourcesRedux from '@exodus/asset-sources/redux'
import exchangeRedux from '@exodus/exchange/lib/redux'
import favoriteAssetsRedux from '@exodus/favorite-assets/redux'
import createFiatBalancesRedux from '@exodus/fiat-balances/redux'
import syncTimeRedux from '@exodus/sync-time/redux'
import activityTxsRedux from '@exodus/activity-txs/redux'
import ordersRedux from '@exodus/orders/redux'
import personalNotesRedux from '@exodus/personal-notes/redux'
import announcementsRedux from '@exodus/announcements/redux'
import postRestoreModalRedux from '@exodus/post-restore-modal/redux'
import apyRates from '@exodus/apy-rates/redux'
import optimisticBalancesRedux from '@exodus/optimistic-balances/redux'
import syncedBalancesRedux from '@exodus/synced-balances/redux'
import profile from '@exodus/profile/redux'

const fiatBalancesRedux = createFiatBalancesRedux({
  optimisticActivityEnabled: false,
})

const createDependencies = () => [
  abTesting,
  assetSourcesRedux,
  exchangeRedux,
  favoriteAssetsRedux,
  fiatBalancesRedux,
  syncTimeRedux,
  activityTxsRedux,
  ordersRedux,
  personalNotesRedux,
  announcementsRedux,
  postRestoreModalRedux,
  apyRates,
  optimisticBalancesRedux,
  syncedBalancesRedux,
  profile(),
]

export default createDependencies
