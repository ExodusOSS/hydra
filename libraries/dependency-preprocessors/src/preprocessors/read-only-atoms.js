import assert from 'minimalistic-assert'
import { readOnly } from '@exodus/atoms'
import { mapValues } from '@exodus/basic-utils'
import { parseDependencyId } from '@exodus/dependency-injection'
import { isAtom, isAtomCollection } from './utils.js'

const readOnlyAtoms = ({ logger, warn = false } = {}) => {
  assert(!warn || logger, 'Logger has to be provided in warn mode')

  const warned = {}

  const preprocess = (node, options) => {
    const { dependenciesById } = options
    const { definition, ...rest } = node
    const { dependencies = [], namespace } = definition

    const canWrite = (atomId) => {
      const dependency = dependenciesById.get(atomId)
      if (!dependency) return false

      const { definition: atomDefinition } = dependency

      return (namespace && atomDefinition.namespace === namespace) || !atomDefinition.namespace
    }

    const atomsMeta = dependencies
      .map(parseDependencyId)
      .filter(({ id }) => isAtom(id) || isAtomCollection(id))

    if (atomsMeta.length === 0) return node

    if (atomsMeta.every((atom) => canWrite(atom.id))) return node

    const logInvalidAccess = ({ id, atom }) => {
      const set = async (...args) => {
        const warningId = `${definition.id}:${id}`
        if (!warned[warningId]) {
          warned[warningId] = true
          logger.warn(
            `"${definition.id}" wrote to "${id}" which is not writeable outside its namespace`
          )
        }

        return atom.set(...args)
      }

      return { ...atom, set }
    }

    const wrapAtom = ({ id, atom }) => {
      if (!atom) return

      if (warn) return logInvalidAccess({ id, atom })

      return readOnly(atom)
    }

    const wrapAtomCollection = ({ id, atomCollection }) => {
      return mapValues(atomCollection, (atom, subId) =>
        canWrite(id) ? atom : wrapAtom({ id: `${id}.${subId}`, atom })
      )
    }

    const factory = (dependencies) => {
      return definition.factory(
        mapValues(dependencies, (dep, id) => {
          if (isAtom(id)) return canWrite(id) ? dep : wrapAtom({ id, atom: dep })

          if (isAtomCollection(id)) return wrapAtomCollection({ id, atomCollection: dep })

          return dep
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
