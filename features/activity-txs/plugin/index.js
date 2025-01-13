import { createAtomObserver } from '@exodus/atoms'

const createActivityTxsPlugin = ({ activityTxsAtom, port }) => {
  const observer = createAtomObserver({ atom: activityTxsAtom, port, event: 'activityTxs' })
  const onLoad = () => {
    observer.start()
  }

  const onStop = () => {
    observer.unregister()
  }

  return { onLoad, onStop }
}

const activityTxsPluginDefinition = {
  id: 'activityTxsPlugin',
  type: 'plugin',
  factory: createActivityTxsPlugin,
  dependencies: ['activityTxsAtom', 'port'],
  public: true,
}

export default activityTxsPluginDefinition
