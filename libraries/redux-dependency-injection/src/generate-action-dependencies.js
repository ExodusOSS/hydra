import lodash from 'lodash'
import { SELF } from './constants.js'

const { zipObject } = lodash

const generateActionDependencies = ({ id, actionsDefinition }) => {
  // from your own package you can only get `.selectors`
  const dependencyIds = actionsDefinition.dependencies.map((dependencyId) =>
    dependencyId === SELF ? `${id}.selectors` : dependencyId
  )

  const dependencyNames = actionsDefinition.dependencies.map((dependencyId) =>
    dependencyId === SELF ? id : dependencyId
  )

  return {
    id: `${id}.actions`,
    type: 'redux-actions',
    factory: (...dependencies) => {
      const dependenciesObj = zipObject(
        dependencyNames,
        dependencies.map((dep, i) =>
          actionsDefinition.dependencies[i] === SELF
            ? {
                selectors: dep,
              }
            : dep
        )
      )

      return actionsDefinition.factory(dependenciesObj)
    },
    dependencies: dependencyIds,
  }
}

export default generateActionDependencies
