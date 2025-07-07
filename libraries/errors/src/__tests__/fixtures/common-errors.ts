const platform = process.env.EXODUS_TEST_PLATFORM

export const commonErrorCases: [Error, { name: string; hint: string }][] = [
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
      hint: 'Cannot read property/properties of undefined',
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
      hint: 'Cannot read property/properties of null',
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
      hint: 'Cannot set property/properties of undefined',
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
      hint: 'Cannot set property/properties of null',
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
          ? 'Cannot read property/properties of undefined'
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
      name: 'UnknownError',
      hint: 'Unexpected end of input',
    },
  ],
]
