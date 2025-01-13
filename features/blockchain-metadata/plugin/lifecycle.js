const createBlockchainLifecyclePlugin = ({
  blockchainMetadata,
  txLogsAtom,
  accountStatesAtom,
  port,
}) => {
  let subscriptions = []

  const onStart = async () => {
    subscriptions.push(
      txLogsAtom.observe(({ changes, newlyReceivedTxLogs }) => {
        if (changes) {
          port.emit('txLogs', { changes })
        }

        if (newlyReceivedTxLogs) port.emit('received-tx-logs-update', newlyReceivedTxLogs)
      }),
      accountStatesAtom.observe(({ changes }) => {
        if (changes) {
          port.emit('accountStates', { changes })
        }
      })
    )
  }

  function emitAll() {
    Promise.all([txLogsAtom.get(), accountStatesAtom.get()]).then(([txLogs, accountStates]) => {
      port.emit('accountStates', { value: accountStates.value })
      port.emit('txLogs', { value: txLogs.value })
    })
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
