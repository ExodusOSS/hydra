import { createInMemoryAtom } from '@exodus/atoms'

import assetPreferencesDefinition from '../asset-preferences.js'

const createAssetPreferences = assetPreferencesDefinition.factory

describe('asset preferences', () => {
  let assetPreferences
  let disabledPurposesAtom
  let multiAddressModeAtom
  let legacyAddressModeAtom
  let taprootAddressModeAtom

  beforeEach(() => {
    disabledPurposesAtom = createInMemoryAtom({ defaultValue: {} })
    multiAddressModeAtom = createInMemoryAtom({ defaultValue: {} })
    legacyAddressModeAtom = createInMemoryAtom({ defaultValue: {} })
    taprootAddressModeAtom = createInMemoryAtom({ defaultValue: {} })

    assetPreferences = createAssetPreferences({
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

  it('should enable legacy address mode for bitcoin', async () => {
    await assetPreferences.enableLegacyAddressMode({ assetNames: ['bitcoin'] })
    await expect(legacyAddressModeAtom.get()).resolves.toEqual({ bitcoin: true })
  })

  it('should throw when non-bitcoin taproot address is enabled', async () => {
    await expect(
      assetPreferences.enableTaprootAddressMode({ assetNames: ['ethereum'] })
    ).rejects.toThrow()
  })

  it('should disable legacy address mode for bitcoin', async () => {
    await legacyAddressModeAtom.set({ bitcoin: true })
    await assetPreferences.disableLegacyAddressMode({ assetNames: ['bitcoin'] })
    await expect(legacyAddressModeAtom.get()).resolves.toEqual({})
  })

  it('should throw when non-bitcoin legacy address is disabled', async () => {
    await expect(
      assetPreferences.disableLegacyAddressMode({ assetNames: ['ethereum'] })
    ).rejects.toThrow()
  })

  it('should enable taproot address mode for bitcoin', async () => {
    await assetPreferences.enableTaprootAddressMode({ assetNames: ['bitcoin'] })
    await expect(taprootAddressModeAtom.get()).resolves.toEqual({ bitcoin: true })
  })

  it('should throw when non-bitcoin taproot address is enabled', async () => {
    await expect(
      assetPreferences.enableTaprootAddressMode({ assetNames: ['ethereum'] })
    ).rejects.toThrow()
  })

  it('should disable taproot address mode for bitcoin', async () => {
    await taprootAddressModeAtom.set({ bitcoin: true })
    await assetPreferences.disableTaprootAddressMode({ assetNames: ['bitcoin'] })
    await expect(taprootAddressModeAtom.get()).resolves.toEqual({})
  })

  it('should throw when non-bitcoin taproot address is disabled', async () => {
    await expect(
      assetPreferences.disableTaprootAddressMode({ assetNames: ['ethereum'] })
    ).rejects.toThrow()
  })
})
