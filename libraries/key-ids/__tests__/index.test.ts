import { createKeyIdentifierForExodus, EXODUS_KEY_IDS } from '../src/index.js'

describe('createKeyIdentifierForExodus', () => {
  test('returns key', () => {
    expect(createKeyIdentifierForExodus({ exoType: 'FUSION' })).toBe(EXODUS_KEY_IDS.FUSION)
  })

  test('throws for unknown type', () => {
    expect(() =>
      // @ts-expect-error -- runtime defense: passing a key outside ExodusKeyId must throw at runtime, even though TS rejects it at compile time
      createKeyIdentifierForExodus({ exoType: 'BATMOBILE' })
    ).toThrow('Invalid exodus key requested')
  })

  test('all registered key ids have unique paths', () => {
    const seen = new Map<string, string>()
    for (const [name, keyId] of Object.entries(EXODUS_KEY_IDS)) {
      if (name === '__proto__') continue

      const { derivationPath } = keyId
      if (seen.has(derivationPath)) {
        throw new Error(
          `Duplicate path: ${derivationPath} for "${name}" and "${seen.get(derivationPath)!}"`
        )
      }

      seen.set(derivationPath, name)
    }
  })
})
