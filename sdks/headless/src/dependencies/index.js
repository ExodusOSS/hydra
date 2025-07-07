/* eslint-disable unicorn/prefer-array-flat */
/* eslint-disable unicorn/prefer-spread */

import assert from 'minimalistic-assert'

import createAdapterDependencies from './adapters.js'
import createAtomDependencies from './atoms.js'
import createConfigDependencies from './configs.js'
import createModuleDependencies from './modules.js'
import createPluginDependencies from './plugins.js'
import { wrapConstant } from './utils.js'

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
