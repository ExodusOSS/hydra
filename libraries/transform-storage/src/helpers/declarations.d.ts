declare module '@exodus/basic-utils' {
  export function mapValuesAsync<Input extends { [key: string]: Value }, Value, MappedValue>(
    obj: Input,
    map: (value: Value, key: string) => Promise<MappedValue> | MappedValue
  ): Promise<{ [key: string]: MappedValue }>
}
