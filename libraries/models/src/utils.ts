import lodash from 'lodash'
import { ModelIdSymbol } from './constants.js'

const { omitBy } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

export const omitUndefined = <T extends object>(obj: T) =>
  omitBy(obj, (value) => value === undefined) as T

export const omitNullable = <T extends object>(obj: T) =>
  omitBy(obj, (value) => value === null || value === undefined) as T as PickNonNullable<T>

type PickNonNullable<T extends object> = {
  [K in keyof T as T[K] extends null | undefined ? never : K]: T[K]
}

interface ModelConstructor {
  [ModelIdSymbol]: string
  new (...args: any): any
}

export const createIsInstance = <C extends ModelConstructor>(clazz: C) => {
  function isInstance(this: C, instance: any): instance is InstanceType<C> {
    if (!instance?.constructor || Object.hasOwn(instance, 'constructor')) {
      return false
    }

    // This is the same as `instance instanceof this`, but it avoids triggering
    // the custom `hasInstance` implementation, preventing infinite recursion.
    if (Function.prototype[Symbol.hasInstance].call(this, instance)) {
      return true
    }

    const considerInstance = this.name === clazz.name || this.name === instance.constructor.name
    return considerInstance && instance.constructor[ModelIdSymbol] === this[ModelIdSymbol]
  }

  return isInstance
}
