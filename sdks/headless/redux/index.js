import applicationRedux from '@exodus/application/redux'
import createReduxIOC from '@exodus/argo/redux/index.js'
import assetsRedux from '@exodus/assets-feature/redux/index.js'
import availableAssetsRedux from '@exodus/available-assets/redux/index.js'
import balancesRedux from '@exodus/balances/redux/index.js'
import accountStatesRedux from '@exodus/blockchain-metadata/redux/account-states/index.js'
import txLogsRedux from '@exodus/blockchain-metadata/redux/tx-logs/index.js'
import enabledAssetsRedux from '@exodus/enabled-assets/redux/index.js'
import featureflagsRedux from '@exodus/feature-flags/redux/index.js'
import feeDataRedux from '@exodus/fee-data-monitors/redux/index.js'
import geolocationRedux from '@exodus/geolocation/redux/index.js'
import localeRedux from '@exodus/locale/redux/index.js'
import ratesRedux from '@exodus/rates-monitor/redux/index.js'
import remoteConfigRedux from '@exodus/remote-config/lib/redux/index.js'
import restoreProgressRedux from '@exodus/restore-progress-tracker/redux/index.js'
import startupCounterRedux from '@exodus/startup-counter/redux/index.js'
import createWalletAccountsRedux from '@exodus/wallet-accounts/redux/index.js'

function createExodusRedux({ createLogger, enhancer, reducers, actionCreators }) {
  const ioc = createReduxIOC({ createLogger, enhancer, reducers, actionCreators })

  const walletAccountsRedux = createWalletAccountsRedux()

  ioc.use(applicationRedux)
  ioc.use(assetsRedux)
  ioc.use(availableAssetsRedux)
  ioc.use(balancesRedux)
  ioc.use(accountStatesRedux)
  ioc.use(txLogsRedux)
  ioc.use(enabledAssetsRedux)
  ioc.use(featureflagsRedux)
  ioc.use(feeDataRedux)
  ioc.use(geolocationRedux)
  ioc.use(localeRedux)
  ioc.use(ratesRedux)
  ioc.use(remoteConfigRedux)
  ioc.use(restoreProgressRedux)
  ioc.use(startupCounterRedux)
  ioc.use(walletAccountsRedux)

  return ioc
}

export default createExodusRedux
