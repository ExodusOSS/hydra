import assert from 'assert'

// so I can copy-pasta tests from Exodus into this repo

// Tape compatibility
function createT() {
  return {
    assert: (arg) => assert(arg),
    true: (arg, desc) => assert.ok(arg, desc),
    false: (arg, desc) => assert.ok(!arg, desc),
    is: (arg1, arg2, desc) => assert.strictEqual(arg1, arg2, desc),
    equal: (arg1, arg2, desc) => assert.strictEqual(arg1, arg2, desc),
    equals: (arg1, arg2, desc) => assert.strictEqual(arg1, arg2, desc),
    same: (arg1, arg2, desc) => assert.deepStrictEqual(arg1, arg2, desc),
    throws: (fn, error, desc) => assert.throws(fn, error, desc),
    end: () => {},
    deepEqual: (arg1, arg2, desc) => assert.deepStrictEqual(arg1, arg2, desc),
    deepEquals: (arg1, arg2, desc) => assert.deepStrictEqual(arg1, arg2, desc),
    plan: () => {},
  }
}

// add skip
test.skip = function () {}

export default function test(description, testCallback) {
  // 'test' put in global by jest
  global['test'](description, () => {
    const t = createT()
    testCallback(t)
  })
}
