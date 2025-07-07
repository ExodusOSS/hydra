import { createAtomObserver } from '@exodus/atoms'

const createConnectedOriginsPlugin = ({
  port,
  connectedOrigins,
  connectedOriginsAtom,
  enabledWalletAccountsAtom,
}) => {
  const connectedOriginsAtomObserver = createAtomObserver({
    port,
    atom: connectedOriginsAtom,
    event: 'connectedOrigins',
  })

  let unsubscribe

  const onLoad = ({ isLocked }) => {
    if (isLocked) return

    connectedOriginsAtomObserver.start()
  }

  const onUnlock = async () => {
    connectedOriginsAtomObserver.start()
    unsubscribe = enabledWalletAccountsAtom.observe(connectedOrigins.updateConnectedAccounts)
  }

  const onClear = async () => {
    await connectedOrigins.clear()
  }

  const onStop = () => {
    connectedOriginsAtomObserver.unregister()
    unsubscribe?.()
  }

  return { onLoad, onUnlock, onClear, onStop }
}

const connectedOriginsPluginDefinition = {
  id: 'connectedOriginsPlugin',
  type: 'plugin',
  factory: createConnectedOriginsPlugin,
  dependencies: ['port', 'connectedOrigins', 'connectedOriginsAtom', 'enabledWalletAccountsAtom'],
  public: true,
}

export default connectedOriginsPluginDefinition
