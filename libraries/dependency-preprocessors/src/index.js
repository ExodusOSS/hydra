import assert from 'minimalistic-assert'
import { partition } from '@exodus/basic-utils'

const validateNode = ({ definition }) => {
  assert(definition && typeof definition === 'object', 'expected "definition"')
}

const compose =
  (options, ...fns) =>
  (params) => {
    validateNode(params)
    return fns.reduceRight((val, fn) => (val ? fn(val, options) : val), params)
  }

const preprocessCollection = ({ dependencies, preprocessors, dependenciesById }) =>
  preprocessors.reduce((acc, { preprocess }) => preprocess(acc, { dependenciesById }), dependencies)

const preprocess = ({ dependencies, preprocessors }) => {
  const dependenciesById = new Map(dependencies.map((dep) => [dep.definition.id, dep]))

  const [collectionPreprocessors, nodePreprocessors] = partition(
    preprocessors,
    (preprocessor) => preprocessor.type === 'collection'
  )

  const transform = compose({ dependenciesById }, ...nodePreprocessors.map((it) => it.preprocess))

  return preprocessCollection({
    dependencies,
    preprocessors: collectionPreprocessors,
    dependenciesById,
  })
    .map(transform)
    .filter(Boolean)
    .map(({ definition }) => definition)
}

export default preprocess
