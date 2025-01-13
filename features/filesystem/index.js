import { filesystemStatsAtomDefinition } from './atoms'
import filesystemMonitorDefinition from './monitor'
import filesystemPluginDefinition from './plugin'

const filesystem = () => {
  return {
    id: 'filesystem',
    definitions: [
      { definition: filesystemPluginDefinition },
      { definition: filesystemMonitorDefinition },
      { definition: filesystemStatsAtomDefinition },
    ],
  }
}

export default filesystem
