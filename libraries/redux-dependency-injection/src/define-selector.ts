import type { SelectorDependency } from './types.js'

type SelectorFn = (...args: never[]) => unknown

export const defineSelectorFactory = <
  const Id extends string,
  const FactoryArgs extends readonly unknown[],
  FactorySelector extends SelectorFn,
  const DependencyList extends readonly SelectorDependency[],
>(definition: {
  id: Id
  selectorFactory: (...args: FactoryArgs) => FactorySelector
  dependencies: DependencyList
}): {
  id: Id
  selectorFactory: (...args: FactoryArgs) => FactorySelector
  dependencies: DependencyList
} => definition

export const defineSelectorResultFunction = <
  const Id extends string,
  const ResultArgs extends readonly unknown[],
  Result,
  const DependencyList extends readonly SelectorDependency[],
>(definition: {
  id: Id
  resultFunction: (...args: ResultArgs) => Result
  dependencies: DependencyList
}): { id: Id; resultFunction: (...args: ResultArgs) => Result; dependencies: DependencyList } =>
  definition
