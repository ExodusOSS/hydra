import { syncTimeAtomDefinition } from './atoms/index.js'
import syncTimePluginDefinition from './plugin/index.js'

const DEFAULT_INTERVAL = 5000

const syncTime = ({ interval = DEFAULT_INTERVAL } = Object.create(null)) => ({
  id: 'syncTime',
  definitions: [
    {
      definition: syncTimeAtomDefinition,
    },
    {
      definition: syncTimePluginDefinition,
      config: { interval },
    },
  ],
})

export default syncTime
