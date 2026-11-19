import { readOnly } from '@exodus/atoms'
import type { Atom } from '@exodus/atoms'
import { mapValues } from '@exodus/basic-utils'
import { parseDependencyId } from '@exodus/dependency-injection'
import assert from 'minimalistic-assert'
import { isAtom, isAtomCollection } from './utils.js'
import type { NodePreprocessor } from '../types.js'

type Logger = {
  warn: (...args: unknown[]) => void
}

const readOnlyAtoms = (
  { logger, warn = false }: { logger?: Logger; warn?: boolean } = Object.create(null)
): NodePreprocessor => {
  assert(!warn || logger, 'Logger has to be provided in warn mode')

  const warned: Record<string, boolean> = Object.create(null)

  const preprocess: NodePreprocessor['preprocess'] = (node, options) => {
    const { dependenciesById } = options
    const { definition, ...rest } = node
    const { dependencies = [], namespace } = definition

    const canWrite = (atomId: string) => {
      const dependency = dependenciesById.get(atomId)
      if (!dependency) return false

      const { definition: atomDefinition } = dependency

      return (namespace && atomDefinition.namespace === namespace) || !atomDefinition.namespace
    }

    const atomsMeta = dependencies
      .map((dependencyId) => parseDependencyId(dependencyId) as { id: string })
      .filter(({ id }) => isAtom(id) || isAtomCollection(id))

    if (atomsMeta.length === 0) return node

    if (atomsMeta.every((atom) => canWrite(atom.id))) return node

    const logInvalidAccess = ({ id, atom }: { id: string; atom: Atom<unknown> }) => {
      const set = async (value: unknown) => {
        const warningId = `${definition.id}:${id}`
        if (!warned[warningId]) {
          warned[warningId] = true
          logger?.warn(
            `"${definition.id}" wrote to "${id}" which is not writeable outside its namespace`
          )
        }

        return atom.set(value)
      }

      return { ...atom, set }
    }

    const wrapAtom = ({ id, atom }: { id: string; atom?: Atom<unknown> }) => {
      if (!atom) return atom

      if (warn) return logInvalidAccess({ id, atom })

      return readOnly(atom)
    }

    const wrapAtomCollection = ({
      id,
      atomCollection,
    }: {
      id: string
      atomCollection: Record<string, Atom<unknown>>
    }) => {
      return mapValues(atomCollection, (atom, subId) => {
        return canWrite(id) ? atom : wrapAtom({ id: `${id}.${subId}`, atom })
      })
    }

    const factory = (dependenciesMap: Record<string, unknown>) => {
      return definition.factory(
        mapValues(dependenciesMap, (dependency, id) => {
          if (isAtom(id)) {
            return canWrite(id) ? dependency : wrapAtom({ id, atom: dependency as Atom<unknown> })
          }

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

    return {
      ...rest,
      definition: {
        ...definition,
        factory,
      },
    }
  }

  return { type: 'node', preprocess }
}

export default readOnlyAtoms
