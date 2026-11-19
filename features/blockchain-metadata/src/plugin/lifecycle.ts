import type { Unsubscribe } from '@exodus/atoms'
import type { BlockchainMetadataAtom, EventPort, LifecycleEvent } from '../types.js'

type LifecycleBlockchainMetadata = {
  load(): Promise<void>
  clear(): Promise<void>
  stop(): void
}

const createBlockchainLifecyclePlugin = ({
  blockchainMetadata,
  blockchainMetadataAtom,
  port,
}: {
  blockchainMetadata: LifecycleBlockchainMetadata
  blockchainMetadataAtom: BlockchainMetadataAtom
  port: EventPort
}) => {
  let subscriptions: Unsubscribe[] = []

  const onStart = async () => {
    subscriptions.push(
      blockchainMetadataAtom.observe(({ accountStateChanges, txLogChanges }) => {
        if (txLogChanges) {
          port.emit('txLogs', { changes: txLogChanges })
        }

        if (accountStateChanges) {
          port.emit('accountStates', { changes: accountStateChanges })
        }
      })
    )
  }

  async function emitAll() {
    const { value } = await blockchainMetadataAtom.get()
    port.emit('accountStates', { value: value.accountStates })
    port.emit('txLogs', { value: value.txs })
  }

  const onLoad = async ({ isLocked }: LifecycleEvent) => {
    if (isLocked) return
    void emitAll()
  }

  const onUnlock = async () => {
    void blockchainMetadata.load().then(() => emitAll())
  }

  const onClear = async () => {
    await blockchainMetadata.clear()
  }

  const onStop = () => {
    subscriptions.forEach((unsubscribe) => unsubscribe())
    subscriptions = []

    blockchainMetadata.stop()
  }

  return { onStart, onUnlock, onClear, onLoad, onStop }
}

export default createBlockchainLifecyclePlugin
