import assert from 'minimalistic-assert'

import createDebug from './debug.js'
import createReporting from './reporting.js'
import { mapValues } from '@exodus/basic-utils'

const asyncify = (fn) => {
  if (typeof fn === 'object') {
    return mapValues(fn, asyncify)
  }

  return async (...args) => fn(...args)
}

const createApi = ({ ioc, port, config, debug, logger }) => {
  const apis = ioc.getByType('api')
  const { application } = ioc.get('applicationApi')

  const featureApis = Object.create(null)
  for (const api of Object.values(apis)) {
    for (const [namespace, methods] of Object.entries(api)) {
      if (!(namespace in featureApis)) {
        // our RPC wrapped features use the proxy client which targets a function (https://github.com/ExodusMovement/exodus-hydra/blob/0e66207c3318051664e57e6b02627169eb7e10b5/libraries/sdk-rpc/src/client.ts#L41),
        // wrapping it further in an async function will break these features
        featureApis[namespace] =
          typeof methods === 'function' ? methods : mapValues(methods, asyncify)

        continue
      }

      for (const [method, implementation] of Object.entries(methods)) {
        assert(
          !(method in featureApis[namespace]),
          `duplicate definition of API method "${method}" in "${namespace}"`
        )

        featureApis[namespace][method] = asyncify(implementation)
      }
    }
  }

  const deprecated = (fn) => {
    return (...args) => {
      logger.warn(
        `"wallet.${fn.name}" is deprecated and will be removed soon, please use "application.${fn.name}"`
      )
      return fn(...args)
    }
  }

  const applicationWalletApi = {
    addSeed: application.addSeed,
    start: deprecated(application.start),
    stop: deprecated(application.stop),
    load: deprecated(application.load),
    unload: deprecated(application.unload),
    create: deprecated(application.create),
    lock: deprecated(application.lock),
    unlock: deprecated(application.unlock),
    import: deprecated(application.import),
    delete: deprecated(application.delete),
    getMnemonic: deprecated(application.getMnemonic),
    setBackedUp: deprecated(application.setBackedUp),
    changePassphrase: deprecated(application.changePassphrase),
    changeLockTimer: deprecated(application.changeLockTimer),
    restartAutoLockTimer: deprecated(application.restartAutoLockTimer),
    restoreFromCurrentPhrase: deprecated(application.restoreFromCurrentPhrase),
  }

  // featureApis.wallet is a proxy when the wallet sdk is used from a separate process, do not spread!
  featureApis.wallet = new Proxy(featureApis.wallet, {
    get(target, prop) {
      if (prop in applicationWalletApi) {
        return applicationWalletApi[prop]
      }

      return target[prop]
    },
  })

  const debugApi = createDebug({ ioc, port, debug })
  const reportingApi = createReporting({ ioc, config: config.reporting })

  const api = {
    ...featureApis,
    reporting: reportingApi,
    subscribe: port.subscribe.bind(port),
    unsubscribe: port.unsubscribe.bind(port),
  }

  if (debugApi) {
    api.debug = debugApi
  }

  return api
}

export default createApi
