const platform = process.env.EXODUS_TEST_PLATFORM

export const commonErrorCases: [Error, { name: string; hint: string; missingStack?: boolean }][] = [
  [
    (() => {
      const a = {}
      try {
        // @ts-expect-error need to test wrong types
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        a.b.c
      } catch (e) {
        return e
      }
    })() as Error,
    {
      name: 'TypeError',
      hint: 'Cannot read properties of undefined',
    },
  ],
  [
    (() => {
      const a = null
      try {
        /* eslint-disable */
        // @ts-expect-error need to test wrong types
        a.b
        /* eslint-enable */
      } catch (e) {
        return e
      }
    })() as Error,
    {
      name: 'TypeError',
      hint: 'Cannot read properties of null',
    },
  ],
  [
    (() => {
      try {
        ;(undefined as any).foo = 123
      } catch (e) {
        return e
      }
    })() as Error,
    {
      name: 'TypeError',
      hint: 'Cannot set properties of undefined',
    },
  ],
  [
    (() => {
      try {
        ;(null as any).foo = 123
      } catch (e) {
        return e
      }
    })() as Error,
    {
      name: 'TypeError',
      hint: 'Cannot set properties of null',
    },
  ],
  [
    (() => {
      try {
        const fn = undefined as any
        fn()
      } catch (e) {
        return e
      }
    })() as Error,
    {
      name: 'TypeError',
      hint: 'Value is not a function',
    },
  ],
  [
    (() => {
      try {
        const Cls = undefined as any
        // eslint-disable-next-line no-new
        new Cls()
      } catch (e) {
        return e
      }
    })() as Error,
    {
      name: 'TypeError',
      hint:
        platform === 'hermes'
          ? 'Cannot read properties of undefined'
          : 'Value is not a constructor',
    },
  ],
  [
    (() => {
      try {
        JSON.parse('')
      } catch (e) {
        return e
      }
    })() as Error,
    {
      name: 'SyntaxError',
      hint: 'JSON Parse error: Unexpected end of input',
      missingStack: platform === 'hermes',
    },
  ],
  [
    (() => {
      try {
        JSON.parse('<html></html>')
      } catch (e) {
        return e
      }
    })() as Error,
    {
      name: 'SyntaxError',
      hint: 'JSON Parse error: Unexpected token',
    },
  ],
  [
    new Error('network request failed'),
    {
      name: 'Error',
      hint: 'Network request failed',
    },
  ],
  [
    new Error('Network Request Failed'),
    {
      name: 'Error',
      hint: 'Network request failed',
    },
  ],
  [
    new Error('network error occurred'),
    {
      name: 'Error',
      hint: 'Network error',
    },
  ],
  [
    new Error('Network Error'),
    {
      name: 'Error',
      hint: 'Network error',
    },
  ],
  [
    new Error('connection failed to server'),
    {
      name: 'Error',
      hint: 'Connection failed',
    },
  ],
  [
    new Error('Connection Failed'),
    {
      name: 'Error',
      hint: 'Connection failed',
    },
  ],
  [
    new Error('request failed with status 500'),
    {
      name: 'Error',
      hint: 'Request failed',
    },
  ],
  [
    new Error('Request Failed'),
    {
      name: 'Error',
      hint: 'Request failed',
    },
  ],
]
