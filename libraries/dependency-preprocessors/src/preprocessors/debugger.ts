import type { Atom } from '@exodus/atoms'
import { wrapAtomsWith } from './utils.js'
import type { DependencyNode, NodePreprocessor } from '../types.js'

type DebugStorage = {
  get: (key: string) => Promise<unknown>
  set: (key: string, value: unknown) => Promise<unknown>
  namespace: (id: string) => DebugStorage
}

type UnsafeStorage = {
  namespace: (id: string) => DebugStorage
}

const debuggerPreprocessor = ({
  debug,
  unsafeStorage,
}: {
  debug?: unknown
  unsafeStorage: UnsafeStorage
}): NodePreprocessor => {
  const storage = unsafeStorage.namespace('debug')

  const processDebugNode = (node: DependencyNode, debugStorage: DebugStorage) => {
    const debugAtom = (id: string, atom: Atom<unknown>) => {
      const set = async (value: unknown) => {
        await debugStorage.set(id, value)
        return atom.set(value)
      }

      return { ...atom, set }
    }

    return wrapAtomsWith(node, debugAtom)
  }

  const processAtomNode = (node: DependencyNode, debugStorage: DebugStorage) => {
    const { definition, ...rest } = node

    const factory = (dependencies: Record<string, unknown>) => {
      const id = definition.id
      const atom = definition.factory(dependencies) as Atom<unknown>
      const isDebug = Boolean((dependencies.config as { debug?: unknown } | undefined)?.debug)

      if (!isDebug) {
        return atom
      }

      const get = async () => {
        const debugValue = await debugStorage.get(id)
        return debugValue || atom.get()
      }

      const set = async (value: unknown) => {
        const debugValue = await debugStorage.get(id)
        return atom.set(debugValue === undefined ? value : debugValue)
      }

      return { ...atom, get, set }
    }

    return { ...rest, definition: { ...definition, factory } }
  }

  const preprocess: NodePreprocessor['preprocess'] = (node) => {
    if (!debug) return node

    if (node.definition.type === 'debug') return processDebugNode(node, storage)
    if (node.definition.type === 'atom') return processAtomNode(node, storage)

    return node
  }

  return { type: 'node', preprocess }
}

export default debuggerPreprocessor
