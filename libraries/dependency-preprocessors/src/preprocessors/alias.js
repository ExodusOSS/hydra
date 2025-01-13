import assert from 'minimalistic-assert'
import { mapKeys } from '@exodus/basic-utils'
import { parseDependencyId } from '@exodus/dependency-injection'
import { createDependencyId } from '../utils.js'

const validateAlias = ({ interfaceId, implementationId }) => {
  assert(interfaceId && typeof interfaceId === 'string', 'expected string "interfaceId"')
  assert(
    implementationId && typeof implementationId === 'string',
    'expected string "implementationId"'
  )
}

const resolveAliases = () => {
  const preprocess = (node) => {
    const { definition, aliases, ...rest } = node
    if (!(definition && aliases)) return node

    assert(Array.isArray(aliases), 'expected array "aliases"')

    const dependenciesMeta = definition.dependencies.map(parseDependencyId)

    aliases.forEach((alias) => {
      validateAlias(alias)
      assert(
        dependenciesMeta.some((it) => it.id === alias.interfaceId),
        `"dependencies" of ${definition.id} is missing interfaceId ${alias.interfaceId}`
      )
    })

    const implementationIdToInterfaceId = new Map(
      aliases.map(({ interfaceId, implementationId }) => [implementationId, interfaceId])
    )

    const interfaceIdToImplementationId = new Map(
      aliases.map(({ interfaceId, implementationId }) => [interfaceId, implementationId])
    )

    return {
      ...rest,
      definition: {
        ...definition,
        factory: (dependencies) => {
          dependencies = mapKeys(
            dependencies,
            (_, implementationId) =>
              implementationIdToInterfaceId.get(implementationId) || implementationId
          )

          return definition.factory(dependencies)
        },
        dependencies: dependenciesMeta.map(({ id, optional }) =>
          createDependencyId({ id: interfaceIdToImplementationId.get(id) || id, optional })
        ),
      },
    }
  }

  return {
    type: 'node',
    preprocess,
  }
}

export default resolveAliases
