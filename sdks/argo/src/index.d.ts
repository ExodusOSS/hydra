import type { Definition, Feature, Node } from '@exodus/dependency-types'

export * from '@exodus/dependency-types'

type IsAny<T> = 0 extends 1 & T ? true : false

// helper to make sure that registration of untyped features don't break type inference
type UpdatedArgo<Current extends Definition, New extends Definition> = IsAny<New> extends true
  ? Argo<Current>
  : Argo<Current | New>

export type InstanceById<D extends Definition> = {
  [Def in D as Def['id']]: ReturnType<Def['factory']>
}

export interface Argo<D extends Definition> {
  register<N extends Node>(node: N): UpdatedArgo<D, N['definition']>
  registerMultiple<N extends Node>(node: readonly N[]): UpdatedArgo<D, N['definition']>
  use<F extends Feature>(feature: F): UpdatedArgo<D, F['definitions'][number]['definition']>
  get<I extends D['id']>(id: I): ReturnType<Extract<D, { id: I }>['factory']>
  getAll(): InstanceById<D>
  getByType<T extends D['type']>(type: T): InstanceById<Extract<D, { type: T }>>
  resolve(): void
}

interface EmptyArgo {
  register<N extends Node>(node: N): Argo<N['definition']>
  registerMultiple<N extends Node>(node: N[]): Argo<N['definition']>
  use<F extends Feature>(feature: F): Argo<F['definitions'][number]['definition']>
  resolve(): void
}

type Params = {
  adapters: { [key: string]: object }
  config?: { [key: string]: object }
  debug?: boolean
}

export default function createIOC(params: Params): EmptyArgo
