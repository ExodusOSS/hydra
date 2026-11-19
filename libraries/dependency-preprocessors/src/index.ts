import assert from 'minimalistic-assert'

import type {
  CollectionPreprocessor,
  DependencyNode,
  NodePreprocessor,
  PreprocessInput,
} from './types.js'

import type { Definition } from '@exodus/dependency-types'

function validateNode(node: DependencyNode | null): asserts node is DependencyNode {
  assert(node?.definition && typeof node.definition === 'object', 'expected "definition"')
}

const compose = (
  options: { dependenciesById: Map<string, DependencyNode> },
  ...fns: NodePreprocessor['preprocess'][]
) => {
  return (params: DependencyNode) => {
    validateNode(params)
    return fns.reduceRight<DependencyNode | null>((value, fn) => {
      return value ? fn(value, options) : value
    }, params)
  }
}

const preprocessCollection = ({
  dependencies,
  preprocessors,
  dependenciesById,
}: {
  dependencies: DependencyNode[]
  preprocessors: CollectionPreprocessor[]
  dependenciesById: Map<string, DependencyNode>
}) => {
  return preprocessors.reduce((acc, { preprocess }) => {
    return preprocess(acc, { dependenciesById })
  }, dependencies)
}

const preprocess = ({ dependencies, preprocessors }: PreprocessInput): Definition[] => {
  const dependenciesById = new Map(
    dependencies.map((dependency) => [dependency.definition.id, dependency])
  )
  const collectionPreprocessors: CollectionPreprocessor[] = []
  const nodePreprocessors: NodePreprocessor[] = []

  for (const preprocessor of preprocessors) {
    if (preprocessor.type === 'collection') {
      collectionPreprocessors.push(preprocessor)
    } else {
      nodePreprocessors.push(preprocessor)
    }
  }

  const transform = compose(
    { dependenciesById },
    ...nodePreprocessors.map((preprocessor) => preprocessor.preprocess)
  )

  return preprocessCollection({
    dependencies,
    preprocessors: collectionPreprocessors,
    dependenciesById,
  })
    .map(transform)
    .filter((node): node is DependencyNode => !!node)
    .map(({ definition }) => definition)
}

export { default as alias } from './preprocessors/alias.js'
export { default as atomsIdentification } from './preprocessors/atoms-identification.js'
export { default as config } from './preprocessors/config.js'
export { default as debuggerPreprocessor } from './preprocessors/debugger.js'
export { default as devModeAtoms } from './preprocessors/dev-mode-atoms.js'
export { default as logify } from './preprocessors/logify.js'
export { default as namespaceStorage } from './preprocessors/namespace-storage.js'
export { default as namespacedErrorTracking } from './preprocessors/namespaced-error-tracking.js'
export { default as optional } from './preprocessors/optional.js'
export { default as performanceMonitor } from './preprocessors/performance-monitor.js'
export { default as readOnlyAtoms } from './preprocessors/read-only-atoms.js'

export type {
  CollectionPreprocessor,
  DependencyNode,
  NodePreprocessor,
  PreprocessContext,
  PreprocessInput,
  Preprocessor,
} from './types.js'

export type { Definition } from '@exodus/dependency-types'

export default preprocess
