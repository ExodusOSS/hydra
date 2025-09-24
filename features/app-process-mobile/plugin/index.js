import { createAtomObserver } from '@exodus/atoms'

const createAppProcessPlugin = ({ appProcess, appProcessAtom, port }) => {
  const appProcessAtomObserver = createAtomObserver({
    port,
    atom: appProcessAtom,
    event: 'appProcess',
  })

  appProcess.load() // do not move this into start, this has to happen as early as possible

  const onLoad = () => {
    appProcessAtomObserver.start()
  }

  const onStop = () => {
    appProcessAtomObserver.unregister()
  }

  return {
    onLoad: Object.defineProperty(onLoad, 'priority', { value: 10, writable: false }),
    onStop,
  }
}

const appProcessPluginDefinition = {
  id: 'appProcessPlugin',
  type: 'plugin',
  factory: createAppProcessPlugin,
  dependencies: ['appProcess', 'appProcessAtom', 'port'],
  public: true,
}

export default appProcessPluginDefinition
