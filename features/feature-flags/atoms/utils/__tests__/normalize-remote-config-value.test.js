import normalizeRemoteConfigValue from '../normalize-remote-config-value.js'

describe('normalizeRemoteConfigValue', () => {
  const scenarios = [
    {
      detail: 'passes through null',
      input: null,
      output: null,
    },
    {
      detail: 'passes through undefined',
      input: undefined,
      output: undefined,
    },
    {
      detail: 'ignores if not object or boolean',
      input: 'abracadabra?',
      output: undefined,
    },
    {
      detail: 'wraps booleans (true)',
      input: true,
      output: { enabled: true },
    },
    {
      detail: 'wraps booleans (false)',
      input: false,
      output: { enabled: false },
    },
    {
      detail: 'passes through valid shutdownSemver strings',
      input: { enabled: true, shutdownSemver: '<1.2.3' },
      output: { enabled: true, shutdownSemver: '<1.2.3' },
    },
    {
      detail: 'skips invalid shutdownSemver strings',
      input: { enabled: true, shutdownSemver: 'please no' },
      output: { enabled: true },
    },
    {
      detail: 'skips shutdownSemver non-strings',
      input: { enabled: true, shutdownSemver: { mobile: true } },
      output: { enabled: true },
    },
  ]

  it.each(scenarios)('normalizes correctly: $detail', ({ input, output }) => {
    expect(normalizeRemoteConfigValue(input)).toEqual(output)
  })
})
