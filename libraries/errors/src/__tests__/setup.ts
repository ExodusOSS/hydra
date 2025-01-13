const platform = process.env.EXODUS_TEST_PLATFORM
if (!platform) {
  throw new Error('EXODUS_TEST_PLATFORM is not set')
}

expect.extend({
  number: (value: any) => {
    const message = `expected number, got: ${value}`
    const pass = typeof value === 'number'
    return { pass, message: () => message }
  },
  filePath: (value: string | null) => {
    if (platform === 'hermes' && value === null) {
      return { pass: true, message: () => `expected string or null, got: ${value}` }
    }

    const message = `expected string, got: ${value}`
    const pass = typeof value === 'string' && /^([a-z]+:|\/)/.test(value)
    return { pass, message: () => message }
  },
})

type MatcherResult = { pass: boolean; message: () => string }

type ExtendedExpect = jest.Expect & {
  number: () => (...args: any[]) => MatcherResult
  filePath: () => (...args: any[]) => MatcherResult
}

export const extendedExpect = expect as ExtendedExpect
