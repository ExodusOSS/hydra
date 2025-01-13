const setBuildMetadataProperties = async ({ analytics, getBuildMetadata }) => {
  analytics.requireDefaultEventProperties(['appId', 'osName'])

  const { appId, osName, deviceModel, platformVersion, deviceManufacturer } =
    await getBuildMetadata()

  analytics.setDefaultEventProperties({
    appId,
    osName,
    deviceModel,
    deviceManufacturer,
    osVersion: platformVersion,
  })

  analytics.setDefaultPropertiesForSanitizationErrors({ osName })
}

const setSystemPreferencesProperties = async ({ analytics, systemPreferences }) => {
  if (!systemPreferences) return
  analytics.requireDefaultEventProperties(['locale'])
  const languages = await systemPreferences.getPreferredLanguages()
  analytics.setDefaultEventProperties({ locale: languages })
}

const setEnvProperties = async ({ analytics, env }) => {
  analytics.setDefaultEventProperties({
    appPlatform: env.platform,
    appVersion: env.version,
    appBuild: env.build === 'development' ? 'dev' : 'prod',
  })

  // just need platform and version since segment
  // makes calls to staging or prod based on API key
  analytics.setDefaultPropertiesForSanitizationErrors({
    appPlatform: env.platform,
    appVersion: env.version,
  })
}

const createHeadlessAnalyticsPlugin = ({ analytics, env, getBuildMetadata, systemPreferences }) => {
  const onStart = async () => {
    Promise.all([
      setEnvProperties({ analytics, env }),
      setBuildMetadataProperties({ analytics, getBuildMetadata }),
      setSystemPreferencesProperties({ analytics, systemPreferences }),
    ])
  }

  return { onStart }
}

const analyticsPluginDefinition = {
  id: 'headlessAnalyticsPlugin',
  type: 'plugin',
  factory: createHeadlessAnalyticsPlugin,
  dependencies: ['analytics', 'env', 'getBuildMetadata', 'systemPreferences?'],
  public: true,
}

export default analyticsPluginDefinition
