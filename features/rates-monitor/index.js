import ms from 'ms'

import ratesApi from './api'
import ratesPlugin from './plugin'
import ratesMonitorDefinition from './module'
import { ratesAtomDefinition } from './atoms'
import ratesReportDefinition from './report'
import ratesDebugDefinition from './debug'

const defaultConfig = {
  fetchInterval: ms('1m'),
  debounceInterval: ms('0.75s'),
  fetchRealTimePricesInterval: ms('20s'),
}

const rates = (config = {}) => {
  config = { ...defaultConfig, ...config }

  return {
    id: 'rates',
    definitions: [
      { definition: ratesAtomDefinition },
      { definition: ratesMonitorDefinition, config },
      { definition: ratesPlugin },
      { definition: ratesApi },
      { definition: ratesReportDefinition },
      { definition: ratesDebugDefinition },
    ],
  }
}

export default rates
