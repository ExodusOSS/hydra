import { filesystemStatsAtomDefinition } from './atoms/index.js'
import filesystemMonitorDefinition from './monitor/index.js'
import filesystemPluginDefinition from './plugin/index.js'

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
