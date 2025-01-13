import { mapValues } from '@exodus/basic-utils'

const ATOM_ID_REGEX = /Atom$/
const ATOM_COLLECTION_ID_REGEX = /Atoms$/

export const isAtom = (id) => ATOM_ID_REGEX.test(id)
export const isAtomCollection = (id) => ATOM_COLLECTION_ID_REGEX.test(id)

export const wrapAtomsWith = (node, fn) => {
  const { definition = [], ...rest } = node

  const wrapAtom = ({ id, atom }) => {
    if (!atom) return
    return fn(id, atom)
  }

  const wrapAtomCollection = ({ id, atomCollection }) => {
    return mapValues(atomCollection, (atom, subId) => wrapAtom({ id, subId, atom }))
  }

  const factory = (dependencies) => {
    return definition.factory(
      mapValues(dependencies, (dep, id) => {
        if (isAtom(id)) return wrapAtom({ id, atom: dep })

        if (isAtomCollection(id)) return wrapAtomCollection({ id, atomCollection: dep })

        return dep
      })
    )
  }

  return { ...rest, definition: { ...definition, factory } }
}
