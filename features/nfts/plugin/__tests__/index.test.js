import * as atoms from '@exodus/atoms'
import EventEmitter from 'events/events.js'

import createNftsLifecyclePlugin from '../lifecycle.js'

describe('nftsLifecyclePlugin', () => {
  let port
  let nftsConfigAtom
  let nftsAtom
  let nftsTxsAtom
  let nftsOptimisticAtom
  let nftCollectionStatsAtom
  let nftBatchMonitorStatusAtom
  let nftsMonitor
  let nfts
  let plugin

  const advance = async () => {
    await new Promise(setImmediate)
  }

  beforeEach(async () => {
    port = { emit: jest.fn() }

    nftsConfigAtom = atoms.createInMemoryAtom({
      defaultValue: {
        'algorand:1234': { hidden: false },
      },
    })

    nftsAtom = atoms.createInMemoryAtom({ defaultValue: {} })

    nftsTxsAtom = atoms.createInMemoryAtom({ defaultValue: {} })

    nftsOptimisticAtom = atoms.createInMemoryAtom({ defaultValue: {} })

    nftCollectionStatsAtom = atoms.createInMemoryAtom({ defaultValue: {} })

    nftBatchMonitorStatusAtom = atoms.createInMemoryAtom({ defaultValue: {} })

    nftsMonitor = new (class extends EventEmitter {
      start = jest.fn()
      stop = jest.fn()
    })()

    nfts = {
      load: jest.fn(),
      clear: jest.fn(),
    }

    plugin = createNftsLifecyclePlugin({
      nfts,
      nftsMonitor,
      port,
      nftsAtom,
      nftsTxsAtom,
      nftsConfigAtom,
      nftsOptimisticAtom,
      nftCollectionStatsAtom,
      nftBatchMonitorStatusAtom,
    })
  })

  it('should create atom observers and register them but not start yet', async () => {
    await advance()
    expect(port.emit).toHaveBeenCalledTimes(0)
  })

  it('should start observing atoms when loaded and unlocked', async () => {
    plugin.onLoad({ isLocked: false })

    await advance()
    expect(port.emit).toHaveBeenCalledTimes(5)
    expect(port.emit.mock.calls).toEqual([
      ['nfts', {}],
      ['nftsTxs', {}],
      ['nftsConfigs', { 'algorand:1234': { hidden: false } }],
      ['nftsOptimistic', {}],
      ['nftCollectionStats', {}],
    ])
  })

  it('should load module when loaded and unlocked', () => {
    plugin.onLoad({ isLocked: false })

    expect(nfts.load).toHaveBeenCalled()
  })

  it('should do nothing when loaded and locked', async () => {
    plugin.onLoad({ isLocked: true })

    expect(nfts.load).not.toHaveBeenCalled()

    await advance()

    expect(port.emit).toHaveBeenCalledTimes(0)
  })

  it('should stop monitor when locked', () => {
    plugin.onLock()

    expect(nftsMonitor.stop).toHaveBeenCalled()
  })

  it('should load module and start monitor when unlocked', () => {
    plugin.onUnlock()

    expect(nfts.load).toHaveBeenCalled()
    expect(nftsMonitor.start).toHaveBeenCalled()
  })

  it('should start observing atoms when unlocked', async () => {
    plugin.onUnlock()

    await advance()
    expect(port.emit).toHaveBeenCalledTimes(5)
    expect(port.emit.mock.calls).toEqual([
      ['nfts', {}],
      ['nftsTxs', {}],
      ['nftsConfigs', { 'algorand:1234': { hidden: false } }],
      ['nftsOptimistic', {}],
      ['nftCollectionStats', {}],
    ])
  })

  it('should clear module when cleared', () => {
    plugin.onClear()

    expect(nfts.clear).toHaveBeenCalled()
  })

  it('should stop monitor when stopped', async () => {
    await plugin.onStop()

    expect(nftsMonitor.stop).toHaveBeenCalled()
  })

  it('should unobserve atoms when stopped', async () => {
    plugin.onStop()

    await advance()
    expect(port.emit).toHaveBeenCalledTimes(0)

    nftsConfigAtom.set({ foo: 'bar' })

    await advance()
    expect(port.emit).toHaveBeenCalledTimes(0)
  })

  it('should emit optimistic nfts when changed', async () => {
    plugin.onLoad({ isLocked: false })

    await advance()
    expect(port.emit).toHaveBeenCalledTimes(5)
    expect(port.emit.mock.calls).toEqual([
      ['nfts', {}],
      ['nftsTxs', {}],
      ['nftsConfigs', { 'algorand:1234': { hidden: false } }],
      ['nftsOptimistic', {}],
      ['nftCollectionStats', {}],
    ])

    port.emit.mockClear()

    await nftsOptimisticAtom.set({
      exodus_0: {
        solana: {
          foo: {
            loaded: true,
          },
        },
      },
    })
    await advance()
    expect(port.emit).toHaveBeenCalledTimes(1)
    expect(port.emit.mock.calls).toEqual([
      ['nftsOptimistic', { exodus_0: { solana: { foo: { loaded: true } } } }],
    ])
  })

  it('should emit collection stats when changed', async () => {
    plugin.onLoad({ isLocked: false })

    await advance()
    expect(port.emit).toHaveBeenCalledTimes(5)
    expect(port.emit.mock.calls).toEqual([
      ['nfts', {}],
      ['nftsTxs', {}],
      ['nftsConfigs', { 'algorand:1234': { hidden: false } }],
      ['nftsOptimistic', {}],
      ['nftCollectionStats', {}],
    ])

    port.emit.mockClear()

    await nftCollectionStatsAtom.set({ 'solana:harrypotter': { floorPrice: 7 } })
    await advance()

    expect(port.emit).toHaveBeenCalledTimes(1)
    expect(port.emit.mock.calls).toEqual([
      ['nftCollectionStats', { 'solana:harrypotter': { floorPrice: 7 } }],
    ])
  })
})
