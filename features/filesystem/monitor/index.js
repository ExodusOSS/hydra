import delay from 'delay'
import { isEqual } from 'lodash'
import ms from 'ms'

const createFilesystemMonitor = ({ filesystemStatsAtom, getFilesystemInfo, logger }) => {
  const start = async () => {
    if (!getFilesystemInfo) return

    while (true) {
      try {
        const [fsInfo, previousValue] = await Promise.all([
          getFilesystemInfo(),
          filesystemStatsAtom.get(),
        ])

        if (isEqual(previousValue, fsInfo)) continue

        await filesystemStatsAtom.set(fsInfo)
      } catch (error) {
        logger.warn('failed to get filesystem stats', error)
      }

      await delay(ms('2m'))
    }
  }

  return { start }
}

const filesystemMonitorDefinition = {
  id: 'filesystemMonitor',
  type: 'monitor',
  factory: createFilesystemMonitor,
  dependencies: ['filesystemStatsAtom', 'getFilesystemInfo?', 'logger'],
  public: true,
}

export default filesystemMonitorDefinition
