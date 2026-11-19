import { createInMemoryAtom } from '@exodus/atoms'
import fusionLocalDefinition from '@exodus/fusion-local/module'
import { createNoopLogger } from '@exodus/logger'
import createInMemoryStorage from '@exodus/storage-memory'

import legacyAddressModeAtomDefinition from '../../atoms/legacy-address-mode.js'
import taprootAddressModeAtomDefinition from '../../atoms/taproot-address-mode.js'
import assetPreferencesDefinition from '../asset-preferences.js'
import assetPlugins from './supported-assets-list.js'

const createAssetPreferences = assetPreferencesDefinition.factory

const assetClientInterface = { createLogger: () => createNoopLogger() }
const assets = Object.fromEntries(
  ['bitcoin', 'bitcoinregtest', 'bitcointestnet', 'ethereum'].map((assetName) => [
    assetName,
    assetPlugins[assetName].createAsset({ assetClientInterface }),
  ])
)
const assetsModule = { getAsset: (assetName) => assets[assetName] }
const bitcoinAssetNames = ['bitcoin', 'bitcoinregtest', 'bitcointestnet']

describe('asset preferences', () => {
  let assetPreferences
  let disabledPurposesAtom
  let multiAddressModeAtom
  let legacyAddressModeAtom
  let taprootAddressModeAtom

  beforeEach(() => {
    disabledPurposesAtom = createInMemoryAtom({ defaultValue: {} })
    multiAddressModeAtom = createInMemoryAtom({ defaultValue: {} })
    const storage = createInMemoryStorage()
    const fusion = fusionLocalDefinition.factory({ storage })
    const logger = createNoopLogger()
    legacyAddressModeAtom = legacyAddressModeAtomDefinition.factory({ storage, fusion, logger })
    taprootAddressModeAtom = taprootAddressModeAtomDefinition.factory({ storage, fusion, logger })

    assetPreferences = createAssetPreferences({
      assetsModule,
      disabledPurposesAtom,
      multiAddressModeAtom,
      legacyAddressModeAtom,
      taprootAddressModeAtom,
    })
  })

  it('should enable multi address mode for passed assets', async () => {
    await assetPreferences.enableMultiAddressMode({ assetNames: ['ethereum', 'bitcoin'] })
    await expect(multiAddressModeAtom.get()).resolves.toEqual({ bitcoin: true, ethereum: true })
  })

  it('should disable multi address mode for passed assets', async () => {
    await multiAddressModeAtom.set({ bitcoin: false, ethereum: true })
    await assetPreferences.disableMultiAddressMode({ assetNames: ['ethereum', 'bitcoin'] })
    await expect(multiAddressModeAtom.get()).resolves.toEqual({ ethereum: false, bitcoin: false })
  })

  it.each(bitcoinAssetNames)('should enable legacy address mode for %s', async (assetName) => {
    await assetPreferences.enableLegacyAddressMode({ assetNames: [assetName] })
    await expect(legacyAddressModeAtom.get()).resolves.toEqual({ [assetName]: true })
  })

  it.each(bitcoinAssetNames)('should disable legacy address mode for %s', async (assetName) => {
    await assetPreferences.enableLegacyAddressMode({ assetNames: bitcoinAssetNames })
    await assetPreferences.disableLegacyAddressMode({ assetNames: [assetName] })

    const value = await legacyAddressModeAtom.get()
    expect(value[assetName]).toBeFalsy()
    for (const otherAssetName of bitcoinAssetNames.filter((name) => name !== assetName)) {
      expect(value[otherAssetName]).toBe(true)
    }
  })

  it.each(bitcoinAssetNames)('should enable taproot address mode for %s', async (assetName) => {
    await assetPreferences.enableTaprootAddressMode({ assetNames: [assetName] })
    await expect(taprootAddressModeAtom.get()).resolves.toEqual({ [assetName]: true })
  })

  it.each(bitcoinAssetNames)('should disable taproot address mode for %s', async (assetName) => {
    await assetPreferences.enableTaprootAddressMode({ assetNames: bitcoinAssetNames })
    await assetPreferences.disableTaprootAddressMode({ assetNames: [assetName] })

    const value = await taprootAddressModeAtom.get()
    expect(value[assetName]).toBeFalsy()
    for (const otherAssetName of bitcoinAssetNames.filter((name) => name !== assetName)) {
      expect(value[otherAssetName]).toBe(true)
    }
  })

  it.each([
    'enableLegacyAddressMode',
    'disableLegacyAddressMode',
    'enableTaprootAddressMode',
    'disableTaprootAddressMode',
  ])('%s should reject assets without bitcoin address types', async (method) => {
    await expect(assetPreferences[method]({ assetNames: ['ethereum'] })).rejects.toThrow(
      `${method} does not support ethereum`
    )
    await expect(assetPreferences[method]({ assetNames: ['bitcoin', 'ethereum'] })).rejects.toThrow(
      `${method} does not support ethereum`
    )
    await expect(legacyAddressModeAtom.get()).resolves.toEqual({})
    await expect(taprootAddressModeAtom.get()).resolves.toEqual({})
  })
})
