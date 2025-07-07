import ms from 'ms'
import { geolocationAtomDefinition } from './atoms/index.js'
import geolocationDebugDefinition from './debug/index.js'
import geolocationMonitorDefinition from './monitor/index.js'
import geolocationPluginDefinition from './plugin/index.js'
import geolocationAnalyticsPluginDefinition from './plugin/analytics.js'

const DEFAULT_CONFIG = {
  fetchInterval: ms('5m'),
  fetchIntervalUntilFirstSuccess: ms('5s'),
}

const ENV_CONFIG = {
  sandbox: {
    apiUrl: 'https://exchange-s.exodus.io/v3/geolocation',
  },
  production: {
    apiUrl: 'https://exchange.exodus.io/v3/geolocation',
  },
}

/**
 * @param sandbox {boolean}
 * @param apiUrl {string}
 * @param fetchInterval {number}
 */

const geolocation = ({ sandbox = false, ...configOverrides } = Object.create(null)) => {
  const environmentConfig = sandbox ? ENV_CONFIG.sandbox : ENV_CONFIG.production
  const { apiUrl, fetchInterval } = { ...DEFAULT_CONFIG, ...environmentConfig, ...configOverrides }

  return {
    id: 'geolocation',
    definitions: [
      { definition: geolocationAtomDefinition },
      {
        definition: geolocationMonitorDefinition,
        config: { apiUrl, fetchInterval },
      },
      { definition: geolocationPluginDefinition },
      {
        if: { registered: ['analytics'] },
        definition: geolocationAnalyticsPluginDefinition,
      },
      { definition: geolocationDebugDefinition },
    ],
  }
}

export default geolocation
