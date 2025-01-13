import { activityTxsAtomDefinition } from './atoms'
import activityTxsPluginDefinition from './plugin'

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
