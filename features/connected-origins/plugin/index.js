import { createAtomObserver } from '@exodus/atoms'

const createConnectedOriginsPlugin = ({ port, connectedOrigins, connectedOriginsAtom }) => {
  const connectedOriginsAtomObserver = createAtomObserver({
    port,
    atom: connectedOriginsAtom,
    event: 'connectedOrigins',
  })

  const onLoad = ({ isLocked }) => {
    if (isLocked) return

    connectedOriginsAtomObserver.start()
  }

  const onUnlock = async () => {
    connectedOriginsAtomObserver.start()
  }

  const onClear = async () => {
    await connectedOrigins.clear()
  }

  const onStop = () => {
    connectedOriginsAtomObserver.unregister()
  }

  return { onLoad, onUnlock, onClear, onStop }
}

const connectedOriginsPluginDefinition = {
  id: 'connectedOriginsPlugin',
  type: 'plugin',
  factory: createConnectedOriginsPlugin,
  dependencies: ['port', 'connectedOrigins', 'connectedOriginsAtom'],
  public: true,
}

export default connectedOriginsPluginDefinition
