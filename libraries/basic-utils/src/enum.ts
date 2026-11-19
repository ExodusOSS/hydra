type EnumProxy<T extends Record<PropertyKey, any>> = Readonly<T>

export default function createEnum<T extends Record<PropertyKey, any>>(obj: T): EnumProxy<T> {
  return new Proxy(obj, {
    get(target, key) {
      if (!Object.prototype.hasOwnProperty.call(target, key)) {
        throw new Error(`enum key not found: ${String(key)}`)
      }

      return target[key as keyof T]
    },
    set() {
      throw new Error('enums are read-only!')
    },
  }) as EnumProxy<T>
}
