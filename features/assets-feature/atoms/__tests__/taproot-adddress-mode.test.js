import fusionLocalDefinition from '@exodus/fusion-local/module'
import createInMemoryStorage from '@exodus/storage-memory'

import taprootAddressModeAtomDefinition from '../taproot-address-mode.js'

const createTaprootAddressModeAtom = taprootAddressModeAtomDefinition.factory
const createFusionLocal = fusionLocalDefinition.factory

const logger = { log: jest.fn() }

describe('taproot address mode atom', () => {
  let storage
  let fusion
  let taprootAddressModeAtom

  beforeEach(() => {
    storage = createInMemoryStorage()
    fusion = createFusionLocal({ storage })
    taprootAddressModeAtom = createTaprootAddressModeAtom({ storage, fusion, logger, config: {} })
  })

  it('should get empty object by default', async () => {
    await expect(taprootAddressModeAtom.get()).resolves.toEqual({})
  })

  it('should write bitcoin value in fusion', async () => {
    await taprootAddressModeAtom.set({ bitcoin: true })
    await expect(taprootAddressModeAtom.get()).resolves.toEqual({ bitcoin: true })
    await expect(fusion.getProfile()).resolves.toMatchObject({ bitcoinTaprootAddressEnabled: true })
  })

  it('should observe when bitcoin asset change in fusion', async () => {
    const listener = jest.fn()
    taprootAddressModeAtom.observe(listener)
    await fusion.mergeProfile({ bitcoinTaprootAddressEnabled: true })
    await new Promise(setImmediate)
    expect(listener).toHaveBeenCalledWith({ bitcoin: true })
  })
})
