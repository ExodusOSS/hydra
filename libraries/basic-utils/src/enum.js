export default function createEnum(obj) {
  return new Proxy(obj, {
    get(target, key) {
      if (!Object.prototype.hasOwnProperty.call(target, key)) {
        throw new Error(`enum key not found: ${key}`)
      }

      return target[key]
    },
    set() {
      throw new Error('enums are read-only!')
    },
  })
}
