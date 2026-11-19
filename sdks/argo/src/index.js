import createIocContainer from '@exodus/dependency-injection'
import preprocess, {
  alias,
  atomsIdentification,
  config as configPreprocessor,
  debuggerPreprocessor,
  devModeAtoms,
  logify,
  namespacedErrorTracking,
  namespaceStorage,
  optional,
  performanceMonitor,
  readOnlyAtoms,
} from '@exodus/dependency-preprocessors'

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
