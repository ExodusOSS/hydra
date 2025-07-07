import { createAtomObserver } from '@exodus/atoms'

const createGeolocationLifecyclePlugin = ({ geolocationMonitor, port, geolocationAtom }) => {
  const geolocationAtomObserver = createAtomObserver({
    port,
    atom: geolocationAtom,
    event: 'geolocation',
  })

  const onStart = async () => {
    geolocationAtomObserver.register()
    geolocationMonitor.start()
  }

  const onLoad = async () => {
    geolocationAtomObserver.start()
  }

  const onStop = () => {
    geolocationAtomObserver.unregister()
    geolocationMonitor.stop()
  }

  return { onStart, onLoad, onStop }
}

const geolocationLifecyclePluginDefinition = {
  id: 'geolocationLifecyclePlugin',
  type: 'plugin',
  factory: createGeolocationLifecyclePlugin,
  dependencies: ['geolocationMonitor', 'port', 'geolocationAtom'],
  public: true,
}

export default geolocationLifecyclePluginDefinition
