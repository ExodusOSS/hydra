import assert from 'minimalistic-assert'
import { mapKeys } from '@exodus/basic-utils'
import { parseDependencyId } from '@exodus/dependency-injection'
import { createDependencyId } from '../utils.js'
import type { DependencyNode, NodePreprocessor } from '../types.js'

type Alias = {
  interfaceId: string
  implementationId: string
}

type AliasedNode = DependencyNode & {
  aliases?: Alias[]
}

const hasAliases = (node: DependencyNode): node is AliasedNode => 'aliases' in node

const validateAlias = ({ interfaceId, implementationId }: Alias) => {
  assert(interfaceId && typeof interfaceId === 'string', 'expected string "interfaceId"')
  assert(
    implementationId && typeof implementationId === 'string',
    'expected string "implementationId"'
  )
}

const resolveAliases = (): NodePreprocessor => {
  const preprocess: NodePreprocessor['preprocess'] = (node) => {
    if (!hasAliases(node) || !node.aliases) return node
    const { definition, aliases, ...rest } = node

    assert(Array.isArray(aliases), 'expected array "aliases"')

    const dependenciesMeta = (definition.dependencies ?? []).map((dependencyId) => {
      return parseDependencyId(dependencyId) as { id: string; optional?: boolean }
    })

    aliases.forEach((alias) => {
      validateAlias(alias)
      assert(
        dependenciesMeta.some((dependency) => dependency.id === alias.interfaceId),
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
        factory: (dependencies: Record<string, unknown>) => {
          const remappedDependencies = mapKeys(dependencies, (_value, implementationId) => {
            return implementationIdToInterfaceId.get(implementationId) || implementationId
          }) as Record<string, unknown>

          return definition.factory(remappedDependencies)
        },
        dependencies: dependenciesMeta.map(({ id, optional }) => {
          return createDependencyId({ id: interfaceIdToImplementationId.get(id) || id, optional })
        }),
      },
    }
  }

  return {
    type: 'node',
    preprocess,
  }
}

export default resolveAliases
