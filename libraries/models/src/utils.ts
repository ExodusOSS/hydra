import lodash from 'lodash'
import { ModelIdSymbol } from './constants.js'

const { omitBy } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

export const omitUndefined = <T extends object>(obj: T) =>
  omitBy(obj, (value) => value === undefined) as T

interface ModelConstructor {
  [ModelIdSymbol]: string
  new (...args: any): any
}

export const createIsInstance = <C extends ModelConstructor>(clazz: C) => {
  function isInstance(this: C, instance: any): instance is InstanceType<C> {
    if (!instance?.constructor || Object.hasOwn(instance, 'constructor')) {
      return false
    }

    if (Function.prototype[Symbol.hasInstance].call(this.constructor, instance)) {
      return true
    }

    const considerInstance = this.name === clazz.name || this.name === instance.constructor.name
    return considerInstance && instance.constructor[ModelIdSymbol] === this[ModelIdSymbol]
  }

  return isInstance
}
