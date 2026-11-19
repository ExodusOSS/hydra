export interface NativeCheck {
  (value: unknown, ...args: unknown[]): boolean
  toJSON: () => string
}

const types: Record<string, NativeCheck | undefined> & {
  Array: NativeCheck
  Boolean: NativeCheck
  Function: NativeCheck
  Nil: NativeCheck
  Null: NativeCheck
  Number: NativeCheck
  Object: NativeCheck
  String: NativeCheck
} = {
  Array(value: unknown): boolean {
    return (
      value !== null &&
      value !== undefined &&
      (value as { constructor: unknown }).constructor === Array
    )
  },
  Boolean(value: unknown): boolean {
    return typeof value === 'boolean'
  },
  Function(value: unknown): boolean {
    return typeof value === 'function'
  },
  Nil(value: unknown): boolean {
    return value === undefined || value === null
  },
  Number(value: unknown): boolean {
    return typeof value === 'number'
  },
  Object(value: unknown): boolean {
    return typeof value === 'object'
  },
  String(value: unknown): boolean {
    return typeof value === 'string'
  },
  ''(): boolean {
    return true
  },
} as never

types.Null = types.Nil

for (const typeName in types) {
  types[typeName]!.toJSON = function (t: string) {
    return t
  }.bind(null, typeName)
}

export default types
