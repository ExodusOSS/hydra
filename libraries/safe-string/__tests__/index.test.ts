/* eslint-disable @typescript-eslint/consistent-type-imports */

describe('safeString', () => {
  let i = 0
  let allowlist: string[]
  let safeStringModule: typeof import('../src/index.js')
  // reload the module to reset the allowlist
  beforeEach(async () => {
    i++
    ;({ default: allowlist } = await import(`../src/allowlist.js?i=${i}`))
    safeStringModule = await import(`../src/index.js?i=${i}`)
  })

  it('should reject regular strings', () => {
    // @ts-expect-error need to test wrong types
    expect(() => safeStringModule.safeString('hello')).toThrow(/template/)
  })

  it('should redact values', () => {
    expect(safeStringModule.isSafe('Tx signing failed: <redacted>')).toBe(false)
    expect(safeStringModule.safeString`Tx signing failed: ${'12w'}`).toBe(
      `Tx signing failed: <redacted> ; SafeArgs: [-1]`
    )
    expect(safeStringModule.isSafe('Tx signing failed: 12w')).toBe(false)
    expect(safeStringModule.isSafe('Tx signing failed: <redacted>')).toBe(true)
  })

  it('should redact multiple values', () => {
    expect(safeStringModule.safeString`Tx signing failed: ${'12w'} and ${'12w'}`).toBe(
      'Tx signing failed: <redacted> and <redacted> ; SafeArgs: [-1,-1]'
    )

    expect(safeStringModule.isSafe('Tx signing failed: <redacted> and <redacted>')).toBe(true)
    expect(safeStringModule.isSafe('Tx signing failed: 12w and 12w')).toBe(false)
  })

  it('should throw when too many interpolated values', () => {
    expect(
      () => safeStringModule.safeString`Tx signing failed: ${'1'} and ${'2'} and ${'3'}`
    ).toThrow(/safeString only supports up to 2 interpolated values/)
  })

  it('should allowlist safe hints', () => {
    expect(safeStringModule.isSafe('broadcastTx')).toBe(true)
  })

  it('interpolates values from allowlist', async () => {
    const safe = safeStringModule.safeString`template part: ${'getNftArguments'}`
    expect(safeStringModule.parseString(safe)).toEqual('template part: getNftArguments')

    const unsafe = safeStringModule.safeString`template part: ${'getNftArguments1'}`
    expect(safeStringModule.parseString(unsafe)).toEqual('template part: <redacted>')
  })

  it('should treat a nested safe string with no interpolated values as a regular string', () => {
    expect(
      safeStringModule.safeString`Tx signing failed: ${safeStringModule.safeString`getNftArguments`}`
    ).toBe(`Tx signing failed: <redacted> ; SafeArgs: [3]`)

    const allowlistLength = allowlist.length
    expect(
      safeStringModule.safeString`Tx signing failed: ${safeStringModule.safeString`nested`}`
    ).toBe(`Tx signing failed: <redacted> ; SafeArgs: [${allowlistLength}]`)
  })

  it('should treat a nested safe string with interpolated values as a regular string', () => {
    // this gets redacted because the nested safe string gets has interpolated values and gets encoded
    expect(
      safeStringModule.safeString`Tx signing failed: ${safeStringModule.safeString`getNftArguments ${'something'}`}`
    ).toBe(`Tx signing failed: <redacted> ; SafeArgs: [-1]`)
  })
})

describe('should not redact in development', () => {
  it('should not redact in development', async () => {
    process.env.NODE_ENV = 'development'
    // @ts-expect-error reload with new process.env
    const { safeString } = await import('../src/index.js?cache=buster')
    expect(safeString`Tx signing failed: ${'12w'}`).toBe('Tx signing failed: 12w')
  })
})
