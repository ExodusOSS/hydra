declare module 'bip32-path' {
  interface BIPPath {
    toPathArray(): number[]
  }
  interface BIPPathConstructor {
    fromString(path: string, reqRoot?: boolean): BIPPath
    new (path: number[]): BIPPath
  }
  const BIPPath: BIPPathConstructor
  export = BIPPath
}

declare module '@exodus/test/tape' {
  interface Tape {
    plan(count: number): void
    ok(value: unknown, message?: string): void
    equals(actual: unknown, expected: unknown, message?: string): void
  }
  function test(name: string, fn: (t: Tape) => void): void
  export { test }
  export default test
}
