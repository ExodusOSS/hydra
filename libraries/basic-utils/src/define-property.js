const defineProperty = (obj, key, value, descriptorOverrides = {}) => {
  const descriptor = {
    value,
    writable: true,
    enumerable: true,
    configurable: true,
    ...descriptorOverrides,
    __proto__: null,
  }
  Object.defineProperty(obj, key, descriptor)
  return obj
}

export default defineProperty
