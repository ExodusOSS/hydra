import { mapValues } from '@exodus/basic-utils'

const atomsIdentificationPreprocessor = () => {
  const preprocess = (node) => {
    // only add the id to atoms, ignore other node types
    if (!['atom', 'atom-collection'].includes(node.definition.type)) return node
    const { definition, ...rest } = node

    const { factory: originalFactory, id, ...definitionRest } = definition

    const factory =
      definition.type === 'atom'
        ? (...opts) => {
            const atom = originalFactory(...opts)
            atom.id = id

            return atom
          }
        : // for atom collections; the factories return an object of <atomId: atom> pairs
          (...deps) =>
            mapValues(originalFactory(...deps), (atom, atomId) => {
              return {
                ...atom,
                id: atom.id || `${id}.${atomId}`,
              }
            })
    return {
      ...rest,
      definition: {
        ...definitionRest,
        id,
        factory,
      },
    }
  }

  return { type: 'node', preprocess }
}

export default atomsIdentificationPreprocessor
