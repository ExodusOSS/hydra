import assetsClientInterfaceDefinition from './client/index.js'
import assetsPluginDefinition from './plugin/index.js'
import multiAddressModeAtomDefinition from './atoms/multi-address-mode.js'
import legacyAddressModeAtomDefinition from './atoms/legacy-address-mode.js'
import taprootAddressModeAtomDefinition from './atoms/taproot-address-mode.js'
import disabledPurposesAtomDefinition from './atoms/disabled-purposes.js'
import assetsApiDefinition from './api/index.js'
import assetModuleDefinition from './module/index.js'
import customTokensMonitorDefinition from './monitor/index.js'
import assetPreferencesDefinition from './module/asset-preferences.js'
import assetsAtomDefinition from './atoms/assets.js'
import assetsReportDefinition from './report/index.js'
import { defaultConfig } from './constants.js'

const assets = (config = Object.create(null)) => {
  const {
    multiAddressMode,
    disabledPurposes,
    compatibilityModeGapLimits,
    compatibilityModeMultiAddressMode,
  } = { ...defaultConfig, ...config }

  return {
    id: 'assets',
    definitions: [
      {
        definition: assetsClientInterfaceDefinition,
        config: {
          compatibilityModeGapLimits,
          compatibilityModeMultiAddressMode,
        },
      },
      { definition: assetsPluginDefinition },
      {
        definition: multiAddressModeAtomDefinition,
        storage: { namespace: 'assetPreferences' },
        config: multiAddressMode,
      },
      { definition: legacyAddressModeAtomDefinition },
      { definition: taprootAddressModeAtomDefinition },
      { definition: assetsAtomDefinition },
      {
        definition: disabledPurposesAtomDefinition,
        storage: { namespace: 'assetPreferences' },
        config: disabledPurposes,
      },
      { definition: assetsApiDefinition },
      // TODO: add storage namespace once we remove customTokensStorage
      // eslint-disable-next-line @exodus/hydra/missing-storage-namespace
      {
        definition: assetModuleDefinition,
        // storage: { namespace: 'customTokens' },
        aliases: [{ implementationId: 'customTokensStorage', interfaceId: 'storage' }],
      },
      { definition: assetPreferencesDefinition },
      { if: { registered: ['customTokensStorage'] }, definition: customTokensMonitorDefinition },
      { definition: assetsReportDefinition },
    ],
  }
}

export default assets
