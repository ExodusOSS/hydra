import { createInMemoryAtom } from '@exodus/atoms'
import { AccountState, TxSet, WalletAccount } from '@exodus/models'

import type { BlockchainMetadataAtom, BlockchainMetadataAtomValue, EventPort } from '../../types.js'
import createBlockchainMetadataPlugin from '../lifecycle.js'

type TestBlockchainMetadata = {
  load: jest.Mock<Promise<void>, []>
  clear: jest.Mock<Promise<void>, []>
  stop: jest.Mock<void, []>
}

type TestPort = EventPort & {
  subscribe(listener: (event: { type: string; payload?: object }) => void): void
}

const createTestPort = (): TestPort => {
  let lastEvent: { type: string; payload?: object } | undefined
  const listeners: ((event: { type: string; payload?: object }) => void)[] = []

  return {
    emit(type, payload) {
      lastEvent = { type, payload }
      const event = lastEvent
      listeners.forEach((listener) => listener(event))
    },
    subscribe(listener) {
      listeners.push(listener)
      if (lastEvent) {
        queueMicrotask(() => listener(lastEvent!))
      }
    },
  }
}

describe('blockchainMetadataPlugin', () => {
  let blockchainMetadata: TestBlockchainMetadata
  let blockchainMetadataAtom: BlockchainMetadataAtom
  let port: TestPort
  let plugin: ReturnType<typeof createBlockchainMetadataPlugin>

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
    port = createTestPort()
    blockchainMetadata = {
      load: jest.fn(async () => {}),
      clear: jest.fn(async () => {}),
      stop: jest.fn(),
    }

    blockchainMetadataAtom = createInMemoryAtom<BlockchainMetadataAtomValue>({
      defaultValue: { value: { txs: {}, accountStates: {} } },
    })
    plugin = createBlockchainMetadataPlugin({
      blockchainMetadata,
      blockchainMetadataAtom,
      port,
    })
  })

  it('should listen to changes and emit after start', async () => {
    await blockchainMetadataAtom.set({
      value: { txs: {}, accountStates: {} },
      txLogChanges: txLogs,
      accountStateChanges: accountStates,
    })

    const handler = jest.fn()
    port.subscribe(handler)

    expect(handler).not.toHaveBeenCalled()

    await plugin.onStart()
    await new Promise<void>((resolve) => port.subscribe(() => resolve()))

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
    await blockchainMetadataAtom.set({
      value: { txs: txLogs, accountStates },
    })

    const handler = jest.fn()
    port.subscribe(handler)

    expect(handler).not.toHaveBeenCalled()

    await plugin.onStart()
    await new Promise(setImmediate)

    expect(handler).not.toHaveBeenCalled()
  })

  it('should emit full data onLoad', async () => {
    await blockchainMetadataAtom.set({
      value: { txs: txLogs, accountStates },
      txLogChanges: {},
      accountStateChanges: {},
    })

    const handler = jest.fn()
    port.subscribe(handler)

    expect(handler).not.toHaveBeenCalled()

    await plugin.onLoad({ isLocked: false })
    await new Promise<void>((resolve) => port.subscribe(() => resolve()))

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
    await blockchainMetadataAtom.set({
      value: { txs: txLogs, accountStates },
      txLogChanges: {},
      accountStateChanges: {},
    })

    const handler = jest.fn()

    port.subscribe(handler)

    expect(handler).not.toHaveBeenCalled()

    await plugin.onUnlock()
    await new Promise<void>((resolve) => port.subscribe(() => resolve()))

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
    await blockchainMetadataAtom.set({
      value: { txs: txLogs, accountStates },
      txLogChanges: {},
      accountStateChanges: {},
    })

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
