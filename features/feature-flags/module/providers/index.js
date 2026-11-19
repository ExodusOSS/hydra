import MixpanelProvider from './mixpanel.js'

export const createProvider = (type, { providerConfig, analytics }) => {
  if (type === 'mixpanel') {
    return new MixpanelProvider({ apiHost: providerConfig.apiHost, analytics })
  }

  throw new Error(`Unknown provider type: ${type}`)
}
