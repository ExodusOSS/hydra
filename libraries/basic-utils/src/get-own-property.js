/**
 * Audit friendly way to get object[key].
 */
export const getOwnProperty = (object, key, expectedType) => {
  const value =
    object && typeof object === 'object' && Object.prototype.hasOwnProperty.call(object, key)
      ? object[key]
      : undefined

  // eslint-disable-next-line valid-typeof
  if (value !== undefined && expectedType !== undefined && typeof value !== expectedType) {
    throw new TypeError(
      `Unexpected type for key ${key}, expected ${expectedType} but got ${typeof value}`
    )
  }

  return value
}
