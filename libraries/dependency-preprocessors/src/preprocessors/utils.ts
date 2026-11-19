import type { Atom } from '@exodus/atoms'
import { mapValues } from '@exodus/basic-utils'
import type { DependencyNode } from '../types.js'

const ATOM_ID_REGEX = /Atom$/u
const ATOM_COLLECTION_ID_REGEX = /Atoms$/u

export const isAtom = (id: string): boolean => ATOM_ID_REGEX.test(id)
export const isAtomCollection = (id: string): boolean => ATOM_COLLECTION_ID_REGEX.test(id)

export const wrapAtomsWith = (
  node: DependencyNode,
  fn: (id: string, atom: Atom<unknown>) => Atom<unknown> | undefined
): DependencyNode => {
  const { definition, ...rest } = node

  const wrapAtom = ({ id, atom }: { id: string; atom?: Atom<unknown> }) => {
    if (!atom) return atom
    return fn(id, atom)
  }

  const wrapAtomCollection = ({
    id,
    atomCollection,
  }: {
    id: string
    atomCollection: Record<string, Atom<unknown>>
  }) => {
    return mapValues(atomCollection, (atom) => wrapAtom({ id, atom }))
  }

  const factory = (dependencies: Record<string, unknown>) => {
    return definition.factory(
      mapValues(dependencies, (dependency, id) => {
        if (isAtom(id)) return wrapAtom({ id, atom: dependency as Atom<unknown> })

        if (isAtomCollection(id)) {
          return wrapAtomCollection({
            id,
            atomCollection: dependency as Record<string, Atom<unknown>>,
          })
        }

        return dependency
      })
    )
  }

  return { ...rest, definition: { ...definition, factory } }
}
