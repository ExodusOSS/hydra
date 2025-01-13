import { wrapAtomsWith } from './utils.js'

const debuggerPreprocessor = ({ debug, unsafeStorage }) => {
  const storage = unsafeStorage.namespace('debug')

  const processDebugNode = (node, storage) => {
    const debugAtom = (id, atom) => {
      const set = async (value) => {
        await storage.set(id, value)
        return atom.set(value)
      }

      return { ...atom, set }
    }

    return wrapAtomsWith(node, debugAtom)
  }

  const processAtomNode = (node, storage) => {
    const { definition, ...rest } = node

    const factory = (dependencies) => {
      const id = definition.id
      const atom = definition.factory(dependencies)
      const isDebug = Boolean(dependencies?.config?.debug)

      if (!isDebug) {
        return atom
      }

      const get = async () => {
        const debugValue = await storage.get(id)
        return debugValue || atom.get()
      }

      const set = async (value) => {
        const debugValue = await storage.get(id)
        return atom.set(debugValue === undefined ? value : debugValue)
      }

      return { ...atom, get, set }
    }

    return { ...rest, definition: { ...definition, factory } }
  }

  const preprocess = (node) => {
    if (!debug) return node

    if (node.definition.type === 'debug') return processDebugNode(node, storage)
    if (node.definition.type === 'atom') return processAtomNode(node, storage)

    return node
  }

  return { type: 'node', preprocess }
}

export default debuggerPreprocessor
