import { createAtomObserver } from '@exodus/atoms'

const createFeesLifecyclePlugin = ({ port, feeMonitors, feeDataAtom }) => {
  const observer = createAtomObserver({ port, atom: feeDataAtom, event: 'feeData' })

  const onLoad = () => {
    observer.start()
  }

  const onUnlock = () => {
    feeMonitors.start()
  }

  const onStop = () => {
    feeMonitors.stop()
    observer.unregister()
  }

  return { onLoad, onUnlock, onStop }
}

const feesLifecyclePluginDefinition = {
  id: 'feesLifecyclePlugin',
  type: 'plugin',
  factory: createFeesLifecyclePlugin,
  dependencies: ['port', 'feeMonitors', 'feeDataAtom'],
  public: true,
}

export default feesLifecyclePluginDefinition
