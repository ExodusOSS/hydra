import { getCardanoV1ExtendedPublicKey } from '../crypto/cardano.js'

// Any 32-byte Uint8Array works — we are not asserting derivation output here,
// just that the returned chainCode does not alias other secret material.
const seed = new Uint8Array(32).fill(0xab)

describe('getCardanoV1ExtendedPublicKey', () => {
  it('returns a chainCode whose underlying buffer does not alias the Byron private seed', async () => {
    const { chainCode } = await getCardanoV1ExtendedPublicKey(seed)

    expect(chainCode).toBeInstanceOf(Uint8Array)
    expect(chainCode.byteLength).toBe(32)
    // If the chainCode were a `subarray` view over the 64-byte HMAC digest,
    // its backing buffer would be 64 bytes long and the first 32 bytes would
    // be the Byron private seed. Confirm the chainCode owns a standalone
    // 32-byte ArrayBuffer so consumers cannot reach the private seed via
    // `chainCode.buffer`.
    expect(chainCode.buffer.byteLength).toBe(32)
    expect(chainCode.byteOffset).toBe(0)
  })
})
