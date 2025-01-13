import { Timer } from '@exodus/timer'
import { createAtomObserver } from '@exodus/atoms'

const createSyncTimePlugin = ({
  config: { interval = 5000 } = {},
  syncTimeAtom,
  port,
  synchronizedTime,
}) => {
  const observer = createAtomObserver({ port, atom: syncTimeAtom, event: 'syncTime' })
  observer.register()

  const timer = new Timer(interval)
  const updateTime = () => {
    syncTimeAtom.set({
      time: synchronizedTime.now(),
      startOfHour: new Date(synchronizedTime.now()).setMinutes(0, 0, 0).valueOf(),
    })
  }

  const onLoad = () => {
    observer.start()
    timer.start(updateTime)
  }

  const onStop = () => {
    observer.unregister()
    timer.stop()
  }

  return { onLoad, onStop }
}

const syncTimePluginDefinition = {
  id: 'syncTimePlugin',
  type: 'plugin',
  factory: createSyncTimePlugin,
  dependencies: ['config', 'syncTimeAtom', 'port', 'synchronizedTime'],
  public: true,
}

export default syncTimePluginDefinition
