import assert, { type AssertPredicate } from 'assert'

// so I can copy-pasta tests from Exodus into this repo

// Tape compatibility
function createT() {
  return {
    assert: (arg: unknown, msg?: string | Error) => assert(arg, msg),
    true: (arg: unknown, desc?: string) => assert.ok(arg, desc),
    false: (arg: unknown, desc?: string) => assert.ok(!arg, desc),
    is: (arg1: unknown, arg2: unknown, desc?: string) => assert.strictEqual(arg1, arg2, desc),
    equal: (arg1: unknown, arg2: unknown, desc?: string) => assert.strictEqual(arg1, arg2, desc),
    equals: (arg1: unknown, arg2: unknown, desc?: string) => assert.strictEqual(arg1, arg2, desc),
    same: (arg1: unknown, arg2: unknown, desc?: string) => assert.deepStrictEqual(arg1, arg2, desc),
    throws: (fn: (...args: any[]) => any, error?: AssertPredicate, desc?: string) =>
      assert.throws(fn, error as AssertPredicate, desc),
    end: () => {},
    deepEqual: (arg1: unknown, arg2: unknown, desc?: string) =>
      assert.deepStrictEqual(arg1, arg2, desc),
    deepEquals: (arg1: unknown, arg2: unknown, desc?: string) =>
      assert.deepStrictEqual(arg1, arg2, desc),
    plan: (count: number) => {}, // eslint-disable-line @typescript-eslint/no-unused-vars
  }
}

type TestCallback = (t: T) => Promise<void> | void
// add skip
test.skip = function (name: string, callback: TestCallback) {} // eslint-disable-line @typescript-eslint/no-unused-vars

export type T = ReturnType<typeof createT>

export default function test(description: string, testCallback: TestCallback) {
  // 'test' put in global by jest
  global['test'](description, () => {
    const t = createT()
    void testCallback(t)
  })
}
