import type { Node, NodeOfType } from '@exodus/dependency-types'

const removeOptionality = (depId: string) => depId.replace(/\?$/u, '')

const isOptional = (depId: string) => depId.endsWith('?')

export const CONTAINER_ID = Symbol.for('container')

export const parseDependencyId = (dependency: string) => {
  return {
    id: removeOptionality(dependency),
    optional: isOptional(dependency),
  }
}

export const wrapConstant = <I extends string, T extends string, V>({
  id,
  type,
  value,
}: {
  id: I
  type: T
  value: V
}): { definition: { id: I; type: T; factory: () => V } } => ({
  definition: { id, type, factory: () => value },
})

export const withType =
  <T extends string>(type: T) =>
  <N extends Node>({ definition, ...rest }: N): NodeOfType<N, T> =>
    ({
      ...rest,
      definition: { type, ...definition },
    }) as NodeOfType<N, T>
