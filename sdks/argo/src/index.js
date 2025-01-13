import createIocContainer from '@exodus/dependency-injection'
import preprocess from '@exodus/dependency-preprocessors'
import alias from '@exodus/dependency-preprocessors/src/preprocessors/alias.js'
import configPreprocessor from '@exodus/dependency-preprocessors/src/preprocessors/config.js'
import debuggerPreprocessor from '@exodus/dependency-preprocessors/src/preprocessors/debugger.js'
import devModeAtoms from '@exodus/dependency-preprocessors/src/preprocessors/dev-mode-atoms.js'
import logify from '@exodus/dependency-preprocessors/src/preprocessors/logify.js'
import namespaceStorage from '@exodus/dependency-preprocessors/src/preprocessors/namespace-storage.js'
import namespacedErrorTracking from '@exodus/dependency-preprocessors/src/preprocessors/namespaced-error-tracking.js'
import optional from '@exodus/dependency-preprocessors/src/preprocessors/optional.js'
import performanceMonitor from '@exodus/dependency-preprocessors/src/preprocessors/performance-monitor.js'
import readOnlyAtoms from '@exodus/dependency-preprocessors/src/preprocessors/read-only-atoms.js'
import atomsIdentification from '@exodus/dependency-preprocessors/src/preprocessors/atoms-identification.js'

import assert from 'minimalistic-assert'

const createIOC = ({ adapters, config, debug }) => {
  const { createLogger, unsafeStorage, performance = {} } = adapters
  const {
    readOnlyAtoms: readOnlyAtomsConfig,
    devModeAtoms: devModeAtomsConfig,
    performanceMonitor: performanceMonitorConfig,
  } = config?.ioc ?? {}

  const ioc = createIocContainer({ logger: createLogger('exodus:ioc') })

  const performanceLogger = createLogger('exodus:performance')

  const preprocessors = [
    logify({ createLogger }),
    performanceMonitorConfig?.enabled &&
      performanceMonitor({
        now: performance.now,
        onAboveThreshold:
          performance.onAboveThreshold ??
          (({ id, method, async, duration }) =>
            performanceLogger.log(
              `${id}.${method} ${async ? 'resolved after' : 'took'} ${duration}ms`
            )),
        config: performanceMonitorConfig,
      }),
    configPreprocessor(),
    alias(),
    // NOTE: order matters, this should come after `alias`
    namespaceStorage(),
    namespacedErrorTracking(),
    readOnlyAtoms({
      logger: createLogger('exodus:read-only-atoms'),
      warn: true,
      ...readOnlyAtomsConfig,
    }),
    optional(),
    devModeAtomsConfig && devModeAtoms(devModeAtomsConfig),
    unsafeStorage && debuggerPreprocessor({ debug, unsafeStorage }),
    atomsIdentification(),
  ].filter(Boolean)

  const nodes = []

  const registerMultiple = (dependencies) => {
    nodes.push(...dependencies)
    return argo
  }

  const register = (dependency) => {
    nodes.push(dependency)
    return argo
  }

  const use = (feature) => {
    for (const { definition } of feature.definitions) {
      assert(definition.type, `ioc.use: "${definition.id}" is missing type field`)
      definition.namespace = feature.id
    }

    registerMultiple(feature.definitions)

    return argo
  }

  const resolve = () => {
    ioc.registerMultiple(preprocess({ dependencies: nodes, preprocessors }))
    ioc.resolve()
  }

  const argo = { ...ioc, resolve, register, registerMultiple, use }

  return argo
}

export default createIOC
