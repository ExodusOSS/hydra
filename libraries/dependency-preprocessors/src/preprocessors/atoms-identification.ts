import type { Atom } from '@exodus/atoms'
import { mapValues } from '@exodus/basic-utils'
import type { NodePreprocessor } from '../types.js'

type IdentifiedAtom = Atom<unknown> & { id?: string }

const atomsIdentificationPreprocessor = (): NodePreprocessor => {
  const preprocess: NodePreprocessor['preprocess'] = (node) => {
    // only add the id to atoms, ignore other node types
    if (!['atom', 'atom-collection'].includes(String(node.definition.type))) return node

    const { definition, ...rest } = node
    const { factory: originalFactory, id, ...definitionRest } = definition

    const factory =
      definition.type === 'atom'
        ? (...opts: unknown[]) => {
            const atom = originalFactory(...opts) as IdentifiedAtom
            atom.id = id

            return atom
          }
        : // for atom collections; the factories return an object of <atomId: atom> pairs
          (...deps: unknown[]) => {
            const atoms = originalFactory(...deps) as Record<string, IdentifiedAtom>
            return mapValues(atoms, (atom, atomId) => {
              return {
                ...atom,
                id: atom.id || `${id}.${atomId}`,
              }
            })
          }

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
