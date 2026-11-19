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

  it('should keep other bitcoin networks in storage', async () => {
    await taprootAddressModeAtom.set({ bitcoin: true, bitcointestnet: true, bitcoinregtest: false })

    await expect(taprootAddressModeAtom.get()).resolves.toEqual({
      bitcoin: true,
      bitcointestnet: true,
      bitcoinregtest: false,
    })
    await expect(storage.get('taprootAddressMode')).resolves.toEqual({
      bitcointestnet: true,
      bitcoinregtest: false,
    })
    await expect(fusion.getProfile()).resolves.toMatchObject({ bitcoinTaprootAddressEnabled: true })
  })

  it('should keep bitcoin when updating another network', async () => {
    await taprootAddressModeAtom.set({ bitcoin: true })
    await taprootAddressModeAtom.set((value) => ({ ...value, bitcointestnet: true }))
    await expect(taprootAddressModeAtom.get()).resolves.toEqual({
      bitcoin: true,
      bitcointestnet: true,
    })

    await taprootAddressModeAtom.set(({ bitcointestnet, ...value }) => value)
    await expect(taprootAddressModeAtom.get()).resolves.toEqual({ bitcoin: true })
  })

  it('should observe when bitcoin asset change in fusion', async () => {
    const listener = jest.fn()
    taprootAddressModeAtom.observe(listener)
    await fusion.mergeProfile({ bitcoinTaprootAddressEnabled: true })
    await new Promise(setImmediate)
    expect(listener).toHaveBeenCalledWith({ bitcoin: true })
  })
})
