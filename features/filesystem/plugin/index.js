import { createAtomObserver } from '@exodus/atoms'

const createFilesystemPlugin = ({ port, filesystemStatsAtom, filesystemMonitor }) => {
  const observer = createAtomObserver({ port, atom: filesystemStatsAtom, event: 'filesystem' })

  const onStart = () => {
    observer.start()
    filesystemMonitor.start()
  }

  const onStop = () => {
    observer.unregister()
  }

  return { onStart, onStop }
}

const filesystemPluginDefinition = {
  id: 'filesystemPlugin',
  type: 'plugin',
  factory: createFilesystemPlugin,
  dependencies: ['port', 'filesystemStatsAtom', 'filesystemMonitor'],
  public: true,
}

export default filesystemPluginDefinition
