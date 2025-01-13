/* eslint-disable @exodus/hydra/missing-storage-namespace */

import walletStartupCountAtomDefinition from './atoms/index.js'
import startupCounterPluginDefinition from './plugin/index.js'

const startupCounter = () => ({
  id: 'startupCounter',
  definitions: [
    {
      definition: startupCounterPluginDefinition,
      writesAtoms: ['walletStartupCountAtom'],
    },
    {
      definition: walletStartupCountAtomDefinition,
      aliases: [{ interfaceId: 'storage', implementationId: 'unsafeStorage' }],
    },
  ],
})

export default startupCounter
