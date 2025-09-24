import { createAtomObserver } from '@exodus/atoms'

const createRatesLifecyclePlugin = ({ ratesMonitor, port, ratesAtom }) => {
  const observer = createAtomObserver({ port, atom: ratesAtom, event: 'rates' })
  observer.register()
  const onLoad = () => {
    ratesMonitor.start()
    observer.start()
  }

  const onStop = () => {
    observer.unregister()
    ratesMonitor.stop()
  }

  const onClear = async () => {}

  return { onLoad, onStop, onClear }
}

const ratesLifecyclePluginDefinition = {
  id: 'ratesLifecyclePlugin',
  type: 'plugin',
  factory: createRatesLifecyclePlugin,
  dependencies: ['ratesMonitor', 'port', 'ratesAtom'],
  public: true,
}

export default ratesLifecyclePluginDefinition
