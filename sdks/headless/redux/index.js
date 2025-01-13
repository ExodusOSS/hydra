import applicationRedux from '@exodus/application/redux'
import createReduxIOC from '@exodus/argo/redux'
import assetsRedux from '@exodus/assets-feature/redux'
import availableAssetsRedux from '@exodus/available-assets/redux'
import balancesRedux from '@exodus/balances/redux'
import accountStatesRedux from '@exodus/blockchain-metadata/redux/account-states'
import txLogsRedux from '@exodus/blockchain-metadata/redux/tx-logs'
import enabledAssetsRedux from '@exodus/enabled-assets/redux'
import featureflagsRedux from '@exodus/feature-flags/redux'
import feeDataRedux from '@exodus/fee-data-monitors/redux'
import geolocationRedux from '@exodus/geolocation/redux'
import localeRedux from '@exodus/locale/redux'
import ratesRedux from '@exodus/rates-monitor/redux'
import remoteConfigRedux from '@exodus/remote-config/lib/redux'
import restoreProgressRedux from '@exodus/restore-progress-tracker/redux'
import startupCounterRedux from '@exodus/startup-counter/redux'
import createWalletAccountsRedux from '@exodus/wallet-accounts/redux'

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
