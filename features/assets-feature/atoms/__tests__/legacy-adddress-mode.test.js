import fusionLocalDefinition from '@exodus/fusion-local/module'
import createInMemoryStorage from '@exodus/storage-memory'

import legacyAddressModeAtomDefinition from '../legacy-address-mode.js'

const createLegacyAddressModeAtom = legacyAddressModeAtomDefinition.factory
const createFusionLocal = fusionLocalDefinition.factory

const logger = { log: jest.fn() }

describe('legacy address mode atom', () => {
  let storage
  let fusion
  let legacyAddressModeAtom

  beforeEach(() => {
    storage = createInMemoryStorage()
    fusion = createFusionLocal({ storage })
    legacyAddressModeAtom = createLegacyAddressModeAtom({ storage, fusion, logger, config: {} })
  })

  it('should get empty object by default', async () => {
    await expect(legacyAddressModeAtom.get()).resolves.toEqual({})
  })

  it('should write bitcoin value in fusion', async () => {
    await legacyAddressModeAtom.set({ bitcoin: true })
    await expect(legacyAddressModeAtom.get()).resolves.toEqual({ bitcoin: true })
    await expect(fusion.getProfile()).resolves.toMatchObject({ bitcoinLegacyAddressEnabled: true })
  })

  it('should observe when bitcoin asset change in fusion', async () => {
    const listener = jest.fn()
    legacyAddressModeAtom.observe(listener)
    await fusion.mergeProfile({ bitcoinLegacyAddressEnabled: true })
    await new Promise(setImmediate)
    expect(listener).toHaveBeenCalledWith({ bitcoin: true })
  })
})
