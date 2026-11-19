import type { Definition } from '@exodus/dependency-types'

export type DependencyNode = {
  definition: Definition
  [key: string]: unknown
}

export type DependenciesById = Map<string, DependencyNode>

export type PreprocessContext = {
  dependenciesById: DependenciesById
}

export type NodePreprocessor = {
  type: 'node'
  preprocess: (node: DependencyNode, context: PreprocessContext) => DependencyNode | null
}

export type CollectionPreprocessor = {
  type: 'collection'
  preprocess: (dependencies: DependencyNode[], context: PreprocessContext) => DependencyNode[]
}

export type Preprocessor = NodePreprocessor | CollectionPreprocessor

export type PreprocessInput = {
  dependencies: DependencyNode[]
  preprocessors: Preprocessor[]
}
