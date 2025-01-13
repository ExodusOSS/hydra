import createAssets from './assets'
import * as exodusCurrency from '@exodus/currency'
import * as localExodusCurrency from '../../src'

import stressTest from './tests/stress'
import txLogTest from './tests/tx-log'
import txLogTestX20 from './tests/tx-log-x20'
import txLogIntegersTest from './tests/tx-log-integers'
import txLogIntegersX20Test from './tests/tx-log-integers-x20'
import exchangeTest from './tests/exchange'

import { modules } from './utils'

// setup the modules to pass to the tests
const implementations = modules

const CurrencyModules = implementations.reduce((modules, implementation) => {
  const currencyModule = require(`./modules/${implementation}`)
  return {
    ...modules,
    [implementation]: { module: currencyModule, assets: createAssets(currencyModule.UnitType) },
  }
}, {})

CurrencyModules['latest'] = {
  module: exodusCurrency,
  assets: createAssets(exodusCurrency.UnitType),
}

CurrencyModules['local'] = {
  module: localExodusCurrency,
  assets: createAssets(localExodusCurrency.UnitType),
}

// run all the tests
const runTest = (test) => {
  test(CurrencyModules)
  console.log('-------------------------')
  console.log()
}

runTest(stressTest)
runTest(txLogTest)
runTest(txLogIntegersTest)
runTest(txLogTestX20)
runTest(txLogIntegersX20Test)
runTest(exchangeTest)
