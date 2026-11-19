import { parseChallenge, serializeChallenge } from '../src/index.js'

const envelope = {
  verifier: 'exodus-pay',
  purpose: 'fusion-key-ownership',
}

const PREFIX = `exodus/challenge/v1:{"verifier":"exodus-pay","purpose":"fusion-key-ownership","`

describe('challenge envelope', () => {
  test('builds the exact bytes both sides compare', () => {
    expect(serializeChallenge({ ...envelope, challenge: 'bm9uY2U=' })).toBe(
      `${PREFIX}challenge":"bm9uY2U="}`
    )
  })

  test('is not itself valid JSON', () => {
    expect(() => JSON.parse(serializeChallenge({ ...envelope, challenge: 'bm9uY2U=' }))).toThrow()
  })

  test('reads back the nonce it was built with', () => {
    const plaintext = serializeChallenge({ ...envelope, challenge: 'bm9uY2U=' })

    expect(parseChallenge({ ...envelope, plaintext })).toBe('bm9uY2U=')
  })

  test('accepts a field appended after the nonce', () => {
    expect(
      parseChallenge({ ...envelope, plaintext: `${PREFIX}challenge":"bm9uY2U=","at":1}` })
    ).toBe('bm9uY2U=')
  })

  test.each([
    ['verifier', { ...envelope, verifier: 'somewhere-else' }],
    ['purpose', { ...envelope, purpose: 'somewhere-else' }],
  ])('refuses a payload minted for another %s', (_field, minted) => {
    const plaintext = serializeChallenge({ ...minted, challenge: 'bm9uY2U=' })

    expect(() => parseChallenge({ ...envelope, plaintext })).toThrow(
      'not a challenge for this verifier and purpose'
    )
  })

  test('refuses a payload from another version of the protocol', () => {
    const plaintext = `exodus/challenge/v2:{"verifier":"exodus-pay","purpose":"fusion-key-ownership","challenge":"bm9uY2U="}`

    expect(() => parseChallenge({ ...envelope, plaintext })).toThrow(
      'not a challenge for this verifier and purpose'
    )
  })

  test('refuses a payload whose first purpose is wrong, however it ends', () => {
    const plaintext = `exodus/challenge/v1:{"verifier":"exodus-pay","purpose":"somewhere-else","challenge":"bm9uY2U=","purpose":"fusion-key-ownership"}`

    expect(() => parseChallenge({ ...envelope, plaintext })).toThrow(
      'not a challenge for this verifier and purpose'
    )
  })

  test('refuses a payload carrying no nonce', () => {
    expect(() => parseChallenge({ ...envelope, plaintext: `${PREFIX}at":1}` })).toThrow(
      'carries no nonce'
    )
  })

  test('refuses a payload outside the namespace', () => {
    const plaintext = JSON.stringify({ ...envelope, challenge: 'bm9uY2U=' })

    expect(() => parseChallenge({ ...envelope, plaintext })).toThrow(
      'not a challenge for this verifier and purpose'
    )
  })
})
