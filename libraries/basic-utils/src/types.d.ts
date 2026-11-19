declare module '@exodus/synchronized-time' {
  export const SynchronizedTime: {
    now(): number
    update(options: { preTime: number; postTime: number; serverTime: number }): void
    debug?: (line: string) => void
  }
}

declare module 'make-concurrent' {
  type MakeConcurrent = <TArgs extends unknown[], TResult>(
    fn: (...args: TArgs) => Promise<TResult> | TResult,
    options?: {
      concurrency?: number
    }
  ) => (...args: TArgs) => Promise<TResult>

  const makeConcurrent: MakeConcurrent
  export default makeConcurrent
}

declare module '@exodus/test/tape' {
  interface Test {
    equal(actual: any, expected: any, msg?: string): void
    ok(value: any, msg?: string): void
    end(): void
  }
  function test(name: string, cb: (t: Test) => void): void
  export default test
}
