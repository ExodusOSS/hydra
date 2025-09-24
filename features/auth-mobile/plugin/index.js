import { createAtomObserver } from '@exodus/atoms'

const createAuthPlugin = ({ port, auth, authAtom, logger }) => {
  const observer = createAtomObserver({ port, atom: authAtom, event: 'auth' })

  const onLoad = async () => {
    await auth.load()
    observer.start()
  }

  const onClear = async () => {
    logger.info('Clearing local device auth credentials')
    await auth.clear()
  }

  const onStop = () => {
    observer.unregister()
  }

  return {
    onLoad: Object.defineProperty(onLoad, 'priority', { value: 5, writable: false }),
    onClear,
    onStop,
  }
}

const authPluginDefinition = {
  id: 'authPlugin',
  type: 'plugin',
  factory: createAuthPlugin,
  dependencies: ['port', 'auth', 'logger', 'authAtom'],
  public: true,
}

export default authPluginDefinition
