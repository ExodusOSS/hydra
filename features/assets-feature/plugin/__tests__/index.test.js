import { createInMemoryAtom } from '@exodus/atoms'
import WildEmitter from '@exodus/wild-emitter'
import EventEmitter from 'events/events.js'

import assetsPluginDefinition from '../index.js'

const { factory: createAssetsPlugin } = assetsPluginDefinition

describe('assetsPlugin', () => {
  let plugin
  let port
  let assetsModule
  let disabledPurposesAtom
  let multiAddressModeAtom
  let legacyAddressModeAtom
  let taprootAddressModeAtom
  let assetsAtom
  let remoteConfigAtom

  const waynecoin = {
    name: 'waynecoin',
    ticker: 'WC',
    api: { hasFeature: jest.fn() },
  }

  beforeEach(() => {
    port = new WildEmitter()
    assetsModule = Object.assign(new EventEmitter(), {
      getAssets: () => ({ waynecoin }),
      load: jest.fn(),
      clear: jest.fn(),
      initialize: jest.fn(),
    })

    disabledPurposesAtom = createInMemoryAtom({ defaultValue: {} })
    assetsAtom = createInMemoryAtom({ defaultValue: {} })
    multiAddressModeAtom = createInMemoryAtom({ defaultValue: {} })
    legacyAddressModeAtom = createInMemoryAtom({ defaultValue: {} })
    taprootAddressModeAtom = createInMemoryAtom({ defaultValue: {} })
    remoteConfigAtom = createInMemoryAtom({ defaultValue: {} })

    plugin = createAssetsPlugin({
      assetsModule,
      assetsAtom,
      assetClientInterface: { setFreshlyCreated: jest.fn() },
      disabledPurposesAtom,
      multiAddressModeAtom,
      legacyAddressModeAtom,
      taprootAddressModeAtom,
      remoteConfigAtom,
      port,
    })
  })

  it('should clear storage onClear', async () => {
    await plugin.onClear()

    expect(assetsModule.clear).toHaveBeenCalledTimes(1)
  })

  describe('freshlyCreated flag', () => {
    let assetClientInterface

    beforeEach(() => {
      assetClientInterface = { setFreshlyCreated: jest.fn() }
      plugin = createAssetsPlugin({
        assetsModule,
        assetsAtom,
        assetClientInterface,
        disabledPurposesAtom,
        multiAddressModeAtom,
        legacyAddressModeAtom,
        taprootAddressModeAtom,
        remoteConfigAtom,
        port,
      })
    })

    it('should mark as freshly created on onCreate', () => {
      plugin.onCreate()
      expect(assetClientInterface.setFreshlyCreated).toHaveBeenCalledWith(true)
    })

    it('should clear freshly created flag on onImport', async () => {
      await plugin.onImport()
      expect(assetClientInterface.setFreshlyCreated).toHaveBeenCalledWith(false)
    })
  })

  describe('assetsAtom', () => {
    const waynecoin = { name: 'waynecoin', api: { hasFeature: jest.fn() } }
    const gothamcoin = { ...waynecoin, name: 'gothamcoin' }

    it('should listen to changes and emit after start', async () => {
      await assetsAtom.set({ value: {}, added: [waynecoin], updated: [gothamcoin], disabled: [] })

      const handler = jest.fn()
      port.subscribe(handler)

      expect(handler).not.toHaveBeenCalled()

      await plugin.onStart()

      expect(handler).toHaveBeenCalledWith({
        type: 'assets-add',
        payload: [waynecoin],
      })

      expect(handler).toHaveBeenCalledWith({
        type: 'assets-update',
        payload: [gothamcoin],
      })
    })

    it('should emit full data onLoad', async () => {
      await assetsAtom.set({ value: { waynecoin }, added: [], updated: [], disabled: [] })

      const handler = jest.fn()
      port.subscribe(handler)

      expect(handler).not.toHaveBeenCalled()

      await plugin.onLoad()

      expect(handler).not.toHaveBeenCalledWith({
        type: 'assets',
        payload: expect.objectContaining({ changes: expect.anything() }),
      })

      expect(handler).toHaveBeenCalledWith({
        type: 'assets',
        payload: { assets: { waynecoin }, defaultAccountStates: expect.anything() },
      })
    })
  })
})
