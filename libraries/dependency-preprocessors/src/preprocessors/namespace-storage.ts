import typeforce from '@exodus/typeforce'
import assert from 'minimalistic-assert'
import type { DependencyNode, NodePreprocessor } from '../types.js'

type StorageLike = {
  namespace: (part: string) => StorageLike
}

type NamespaceStorageConfig = {
  namespace: string | string[]
  interfaceId?: string
}

const nonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0
const nonEmptyStringArray = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.length > 0 && value.every(nonEmptyString)
}

const parseStorageOpts = (opts: NamespaceStorageConfig) => {
  typeforce(
    {
      namespace: typeforce.oneOf(nonEmptyString, nonEmptyStringArray),
      interfaceId: typeforce.maybe(nonEmptyString),
    },
    opts
  )

  return {
    interfaceId: opts.interfaceId || 'storage',
    namespace: Array.isArray(opts.namespace) ? opts.namespace : [opts.namespace],
  }
}

type StorageNode = DependencyNode & {
  storage?: NamespaceStorageConfig
}

const hasStorage = (node: DependencyNode): node is StorageNode => 'storage' in node

const namespaceStorage = (): NodePreprocessor => {
  const preprocess: NodePreprocessor['preprocess'] = (node) => {
    if (!hasStorage(node) || !node.storage) return node
    const { definition, storage, ...rest } = node

    const { namespace: namespaceArr, interfaceId: storageInterfaceId } = parseStorageOpts(storage)
    return {
      ...rest,
      definition: {
        ...definition,
        factory: (deps: Record<string, unknown>) => {
          const namespacedDeps = { ...deps }
          const baseStorage = namespacedDeps[storageInterfaceId] as StorageLike | undefined

          assert(baseStorage, `expected param "${storageInterfaceId}"`)

          namespacedDeps[storageInterfaceId] = namespaceArr.reduce((currentStorage, part) => {
            return currentStorage.namespace(part)
          }, baseStorage)

          return definition.factory(namespacedDeps)
        },
      },
    }
  }

  return { type: 'node', preprocess }
}

export default namespaceStorage
