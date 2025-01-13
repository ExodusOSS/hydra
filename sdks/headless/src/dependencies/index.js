/* eslint-disable unicorn/prefer-array-flat */
/* eslint-disable unicorn/prefer-spread */

import assert from 'minimalistic-assert'

import createAdapterDependencies from './adapters'
import createAtomDependencies from './atoms'
import createConfigDependencies from './configs'
import createModuleDependencies from './modules'
import createPluginDependencies from './plugins'
import { wrapConstant } from './utils'

const adapterKeys = ['createLogger', 'legacyPrivToPub', 'unsafeStorage', 'fetch', 'freeze']

const createDependencies = ({ adapters, config }) => {
  assert(config, 'expected config object')

  adapterKeys.forEach((key) => assert(adapters[key], `expected adapter "${key}"`))

  const logger = adapters.createLogger('exodus')

  const configs = createConfigDependencies({ adapters, config })

  const modules = createModuleDependencies({ adapters, config })

  const atoms = createAtomDependencies({ adapters, config })

  const adaptersTree = createAdapterDependencies({ adapters, config })

  const plugins = createPluginDependencies()

  return []
    .concat(adaptersTree)
    .concat(configs)
    .concat(modules)
    .concat(atoms)
    .concat(plugins)
    .concat(wrapConstant({ id: 'logger', type: 'module', value: logger }))
}

export default createDependencies
