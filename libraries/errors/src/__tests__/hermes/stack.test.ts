import parseStackTrace from '../../stack.js'
import { extendedExpect } from '../setup.js'

function foo() {
  return new Error('boo')
}

it(`gets stack trace for hermes`, () => {
  const err = foo()
  const stack = parseStackTrace(err)!
  const { stack: originalStack } = err
  expect(err.stack).toEqual(originalStack)
  extendedExpect(Array.isArray(stack)).toBe(true)
  extendedExpect(stack).toEqual(
    [
      {
        async: false,
        column: 21,
        file: '/var/folders/rc/vrsk5hn52d50hd4rzphbsw9h0000gn/T/exodus-test-c42e233c/src/__tests__/hermes/stack.test.ts-ad53e9c9.js',
        function: 'foo',
        line: 22_308,
        method: null,
        toplevel: null,
      },
      {
        async: false,
        column: 21,
        file: '/var/folders/rc/vrsk5hn52d50hd4rzphbsw9h0000gn/T/exodus-test-c42e233c/src/__tests__/hermes/stack.test.ts-ad53e9c9.js',
        function: null,
        line: 22_323,
        method: null,
        toplevel: null,
      },
      {
        async: false,
        column: 37,
        file: '/var/folders/rc/vrsk5hn52d50hd4rzphbsw9h0000gn/T/exodus-test-c42e233c/src/__tests__/hermes/stack.test.ts-ad53e9c9.js',
        function: '?anon_0_?anon_0_runFunction',
        line: 8554,
        method: null,
        toplevel: null,
      },
      {
        async: false,
        column: null,
        file: null,
        function: 'next',
        line: null,
        method: null,
        toplevel: null,
      },
      {
        async: false,
        column: 24,
        file: '/Users/distiller/project/build/lib/InternalBytecode/InternalBytecode.js',
        function: null,
        line: 542,
        method: null,
        toplevel: null,
      },
      {
        async: false,
        column: 23,
        file: '/Users/distiller/project/build/lib/InternalBytecode/InternalBytecode.js',
        function: 'step',
        line: 516,
        method: null,
        toplevel: null,
      },
      {
        async: false,
        column: 11,
        file: '/Users/distiller/project/build/lib/InternalBytecode/InternalBytecode.js',
        function: null,
        line: 541,
        method: null,
        toplevel: null,
      },
      {
        async: false,
        column: 9,
        file: '/Users/distiller/project/build/lib/InternalBytecode/InternalBytecode.js',
        function: 'tryCallTwo',
        line: 61,
        method: null,
        toplevel: null,
      },
      {
        async: false,
        column: 25,
        file: '/Users/distiller/project/build/lib/InternalBytecode/InternalBytecode.js',
        function: 'doResolve',
        line: 216,
        method: null,
        toplevel: null,
      },
      {
        async: false,
        column: 14,
        file: '/Users/distiller/project/build/lib/InternalBytecode/InternalBytecode.js',
        function: 'Promise',
        line: 82,
        method: null,
        toplevel: null,
      },
      {
        async: false,
        column: 29,
        file: '/Users/distiller/project/build/lib/InternalBytecode/InternalBytecode.js',
        function: 'spawn',
        line: 511,
        method: null,
        toplevel: null,
      },
      {
        async: false,
        column: 7,
        file: '/var/folders/rc/vrsk5hn52d50hd4rzphbsw9h0000gn/T/exodus-test-c42e233c/src/__tests__/hermes/stack.test.ts-ad53e9c9.js',
        function: 'runFunction',
        line: 8553,
        method: null,
        toplevel: null,
      },
      {
        async: false,
        column: 59,
        file: '/var/folders/rc/vrsk5hn52d50hd4rzphbsw9h0000gn/T/exodus-test-c42e233c/src/__tests__/hermes/stack.test.ts-ad53e9c9.js',
        function: '?anon_0_?anon_0_runContext',
        line: 8595,
        method: null,
        toplevel: null,
      },
      {
        async: false,
        column: null,
        file: null,
        function: 'next',
        line: null,
        method: null,
        toplevel: null,
      },
      {
        async: false,
        column: 30,
        file: '/Users/distiller/project/build/lib/InternalBytecode/InternalBytecode.js',
        function: null,
        line: 531,
        method: null,
        toplevel: null,
      },
      {
        async: false,
        column: 23,
        file: '/Users/distiller/project/build/lib/InternalBytecode/InternalBytecode.js',
        function: 'step',
        line: 516,
        method: null,
        toplevel: null,
      },
      {
        async: false,
        column: 17,
        file: '/Users/distiller/project/build/lib/InternalBytecode/InternalBytecode.js',
        function: null,
        line: 530,
        method: null,
        toplevel: null,
      },
      {
        async: false,
        column: 16,
        file: '/Users/distiller/project/build/lib/InternalBytecode/InternalBytecode.js',
        function: 'tryCallOne',
        line: 53,
        method: null,
        toplevel: null,
      },
      {
        async: false,
        column: 27,
        file: '/Users/distiller/project/build/lib/InternalBytecode/InternalBytecode.js',
        function: null,
        line: 139,
        method: null,
        toplevel: null,
      },
    ].map((frame) => ({
      ...frame,
      file: extendedExpect.filePath(),
      line: frame.line === null ? frame.line : extendedExpect.number(),
      column: frame.column === null ? frame.column : extendedExpect.number(),
    }))
  )
})
