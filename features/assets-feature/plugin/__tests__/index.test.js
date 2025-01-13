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
    })

    disabledPurposesAtom = createInMemoryAtom({ defaultValue: {} })
    assetsAtom = createInMemoryAtom({ defaultValue: {} })
    multiAddressModeAtom = createInMemoryAtom({ defaultValue: {} })
    legacyAddressModeAtom = createInMemoryAtom({ defaultValue: {} })
    taprootAddressModeAtom = createInMemoryAtom({ defaultValue: {} })

    plugin = createAssetsPlugin({
      assetsModule,
      assetsAtom,
      disabledPurposesAtom,
      multiAddressModeAtom,
      legacyAddressModeAtom,
      taprootAddressModeAtom,
      port,
    })
  })

  it('should clear storage onClear', async () => {
    await plugin.onClear()

    expect(assetsModule.clear).toHaveBeenCalledTimes(1)
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
