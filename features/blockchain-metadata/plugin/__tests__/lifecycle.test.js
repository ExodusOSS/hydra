import { createInMemoryAtom } from '@exodus/atoms'
import { AccountState, TxSet, WalletAccount } from '@exodus/models'
import WildEmitter from '@exodus/wild-emitter'
import EventEmitter from 'events/events.js'

import createBlockchainMetadataPlugin from '../lifecycle.js'

describe('blockchainMetadataPlugin', () => {
  let txLogsAtom
  let accountStatesAtom
  let blockchainMetadata
  let port
  let plugin

  const txLogs = {
    [WalletAccount.DEFAULT_NAME]: {
      bitcoin: TxSet.EMPTY,
    },
  }

  const EthAccountState = class extends AccountState {}

  const accountStates = {
    [WalletAccount.DEFAULT_NAME]: {
      ethereum: EthAccountState.create({}),
    },
  }

  beforeEach(() => {
    port = new WildEmitter()
    blockchainMetadata = Object.assign(new EventEmitter(), {
      load: jest.fn(async () => null),
      stop: jest.fn(),
    })

    txLogsAtom = createInMemoryAtom()
    accountStatesAtom = createInMemoryAtom()
    plugin = createBlockchainMetadataPlugin({
      blockchainMetadata,
      accountStatesAtom,
      txLogsAtom,
      port,
    })
  })

  it('should listen to changes and emit after start', async () => {
    await txLogsAtom.set({ value: {}, changes: txLogs })
    await accountStatesAtom.set({ value: {}, changes: accountStates })

    const handler = jest.fn()
    port.subscribe(handler)

    expect(handler).not.toHaveBeenCalled()

    await plugin.onStart()
    await new Promise((resolve) => port.subscribe(resolve))

    expect(handler).toHaveBeenCalledWith({
      type: 'txLogs',
      payload: { changes: txLogs },
    })

    expect(handler).toHaveBeenCalledWith({
      type: 'accountStates',
      payload: { changes: accountStates },
    })
  })

  it('should not emit full load payload onStart', async () => {
    await txLogsAtom.set({ value: txLogs })
    await accountStatesAtom.set({ value: accountStates })

    const handler = jest.fn()
    port.subscribe(handler)

    expect(handler).not.toHaveBeenCalled()

    await plugin.onStart()
    await new Promise(setImmediate)

    expect(handler).not.toHaveBeenCalled()
  })

  it('should emit full data onLoad', async () => {
    await txLogsAtom.set({ value: txLogs, changes: {} })
    await accountStatesAtom.set({ value: accountStates, changes: {} })

    const handler = jest.fn()
    port.subscribe(handler)

    expect(handler).not.toHaveBeenCalled()

    await plugin.onLoad({ isLocked: false })
    await new Promise((resolve) => port.subscribe(resolve))

    expect(handler).not.toHaveBeenCalledWith({
      type: 'txLogs',
      payload: expect.objectContaining({ changes: expect.anything() }),
    })

    expect(handler).not.toHaveBeenCalledWith({
      type: 'accountStates',
      payload: expect.objectContaining({ changes: expect.anything() }),
    })

    expect(handler).toHaveBeenCalledWith({
      type: 'txLogs',
      payload: { value: txLogs },
    })

    expect(handler).toHaveBeenCalledWith({
      type: 'accountStates',
      payload: { value: accountStates },
    })
  })

  it('should emit full data onUnlock', async () => {
    await txLogsAtom.set({ value: txLogs, changes: {} })
    await accountStatesAtom.set({ value: accountStates, changes: {} })

    const handler = jest.fn()

    port.subscribe(handler)

    expect(handler).not.toHaveBeenCalled()

    await plugin.onUnlock()
    await new Promise((resolve) => port.subscribe(resolve))

    expect(handler).toHaveBeenCalledWith({
      type: 'txLogs',
      payload: { value: txLogs },
    })

    expect(handler).toHaveBeenCalledWith({
      type: 'accountStates',
      payload: { value: accountStates },
    })
  })

  it('should not emit onLoad when locked', async () => {
    await txLogsAtom.set({ value: txLogs, changes: {} })
    await accountStatesAtom.set({ value: accountStates, changes: {} })

    const handler = jest.fn()
    port.subscribe(handler)

    await plugin.onLoad({ isLocked: true })
    await new Promise(setImmediate)

    expect(handler).not.toHaveBeenCalled()
  })

  it('should stop subscriptions in the module onStop', () => {
    plugin.onStop()

    expect(blockchainMetadata.stop).toHaveBeenCalled()
  })
})
