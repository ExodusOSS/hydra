export type Factory = {
  (...args: any): any
  id?: string
  dependencies?: readonly string[]
}

export type Definition = {
  id: string
  type?: string
  factory: Factory
  dependencies?: readonly string[]
  injectDependenciesAsPositionalArguments?: boolean
  override?: boolean
  namespace?: string
  public?: boolean
}

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }
type PreprocessorConfig = { [preprocessor: string]: any }

export type Node = { definition: Definition } & PreprocessorConfig
export type FeatureNode = { definition: WithRequired<Definition, 'type'> } & PreprocessorConfig

export type Feature = {
  id: string
  definitions: readonly FeatureNode[]
}

export type FeatureFactory = (...args: any[]) => Feature

export type NodeOfType<N extends Node, T extends string> = Omit<N, 'definition'> & {
  definition: Omit<N['definition'], 'type'> & { type: T }
}

export type InstanceById<D extends Definition> = {
  [Def in D as Def['id']]: ReturnType<Def['factory']>
}
