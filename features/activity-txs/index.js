import { activityTxsAtomDefinition } from './atoms/index.js'
import activityTxsPluginDefinition from './plugin/index.js'
import { safeString } from '@exodus/safe-string'

const activityTxs = () => ({
  id: safeString`activityTxs`,
  definitions: [
    {
      definition: activityTxsAtomDefinition,
    },
    { definition: activityTxsPluginDefinition },
  ],
})

export default activityTxs
