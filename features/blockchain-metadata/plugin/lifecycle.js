const createBlockchainLifecyclePlugin = ({ blockchainMetadata, blockchainMetadataAtom, port }) => {
  let subscriptions = []

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

  const onLoad = async ({ isLocked }) => {
    if (isLocked) return
    emitAll()
  }

  const onUnlock = async () => {
    blockchainMetadata.load().then(() => emitAll())
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
