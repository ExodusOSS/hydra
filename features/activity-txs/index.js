import { activityTxsAtomDefinition } from './atoms/index.js'
import activityTxsPluginDefinition from './plugin/index.js'

const activityTxs = () => ({
  id: 'activityTxs',
  definitions: [
    {
      definition: activityTxsAtomDefinition,
    },
    { definition: activityTxsPluginDefinition },
  ],
})

export default activityTxs
