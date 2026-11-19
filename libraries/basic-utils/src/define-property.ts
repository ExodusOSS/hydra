const defineProperty = <T>(
  obj: T,
  key: PropertyKey,
  value: unknown,
  descriptorOverrides: Partial<PropertyDescriptor> = {}
): T => {
  const descriptor: PropertyDescriptor = {
    value,
    writable: true,
    enumerable: true,
    configurable: true,
    ...descriptorOverrides,
    // @ts-expect-error unknown property in type
    __proto__: null,
  }
  Object.defineProperty(obj, key, descriptor)
  return obj
}

export default defineProperty
