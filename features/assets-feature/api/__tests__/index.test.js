import fusionLocalDefinition from '@exodus/fusion-local/module'
import createInMemoryStorage from '@exodus/storage-memory'

import disabledPurposesAtomDefinition from '../../atoms/disabled-purposes.js'
import multiAddressModeAtomDefinition from '../../atoms/multi-address-mode.js'
import { disabledPurposesDefaultConfig, multiAddressModeDefaultConfig } from '../../constants.js'
import assetPreferencesModuleDefinition from '../../module/asset-preferences.js'
import assetsApiDefinition from '../index.js'

const logger = console
const createFusionLocal = fusionLocalDefinition.factory

describe('profile api', () => {
  let api
  let disabledPurposesAtom
  let multiAddressModeAtom
  let assetPreferencesModule
  const assetsModule = {}

  beforeEach(() => {
    disabledPurposesAtom = disabledPurposesAtomDefinition.factory({
      storage: createInMemoryStorage(),
      logger,
      config: disabledPurposesDefaultConfig,
    })

    multiAddressModeAtom = multiAddressModeAtomDefinition.factory({
      storage: createInMemoryStorage(),
      fusion: createFusionLocal({ storage: createInMemoryStorage() }),
      logger,
      config: multiAddressModeDefaultConfig,
    })

    assetPreferencesModule = assetPreferencesModuleDefinition.factory({
      disabledPurposesAtom,
      multiAddressModeAtom,
      logger,
    })

    api = assetsApiDefinition.factory({
      assetPreferences: assetPreferencesModule,
      assetsModule,
      logger,
    }).assetPreferences
  })

  it('should support disabling purposes', async () => {
    await api.disablePurpose({ assetName: 'bitcoin', purpose: 86 })
    expect(await disabledPurposesAtom.get()).toEqual({ bitcoin: [86] })

    await api.enablePurpose({ assetName: 'bitcoin', purpose: 86 })
    expect(await disabledPurposesAtom.get()).toEqual({ bitcoin: [] })
  })

  it('should support toggling multiAddressMode', async () => {
    await api.enableMultiAddressMode({ assetNames: ['bitcoin', 'litecoin', 'monero'] })
    expect(await multiAddressModeAtom.get()).toEqual({
      bitcoin: true,
      litecoin: true,
      monero: true,
    })

    await api.disableMultiAddressMode({ assetNames: ['bitcoin', 'monero'] })
    expect(await multiAddressModeAtom.get()).toEqual({
      litecoin: true,
      bitcoin: false,
      monero: false,
    })
  })
})
