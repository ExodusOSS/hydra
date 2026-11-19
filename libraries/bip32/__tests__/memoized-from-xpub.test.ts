import BIP32 from '../src/index.js'

const XPUB =
  'xpub6FnCn6nSzZAw5Tw7cgR9bi15UV96gLZhjDstkXXxvCLsUXBGXPdSnLFbdpq8p9HmGsApME5hQTZ3emM2rnY5agb9rXpVGyy3bdW6EEgAtqt'

describe('memoizedFromXPub', () => {
  beforeEach(() => {
    BIP32.memoizedFromXPub.reset()
  })

  test('caches result for identical (xpub, skipVerification) calls', () => {
    const a = BIP32.memoizedFromXPub(XPUB)
    const b = BIP32.memoizedFromXPub(XPUB)
    expect(b).toBe(a)

    const c = BIP32.memoizedFromXPub(XPUB, { skipVerification: true })
    const d = BIP32.memoizedFromXPub(XPUB, { skipVerification: true })
    expect(d).toBe(c)
  })

  test('treats default and explicit skipVerification: false as the same cache entry', () => {
    const a = BIP32.memoizedFromXPub(XPUB)
    const b = BIP32.memoizedFromXPub(XPUB, { skipVerification: false })
    expect(b).toBe(a)
  })

  test('does not return an unverified cached instance to a verified call', () => {
    const skipped = BIP32.memoizedFromXPub(XPUB, { skipVerification: true })
    const verified = BIP32.memoizedFromXPub(XPUB)
    expect(verified).not.toBe(skipped)
  })

  test('does not collapse skipVerification: true and skipVerification: false', () => {
    const verified = BIP32.memoizedFromXPub(XPUB)
    const skipped = BIP32.memoizedFromXPub(XPUB, { skipVerification: true })
    expect(skipped).not.toBe(verified)
  })

  test('still produces equivalent xpubs across cache slots', () => {
    const verified = BIP32.memoizedFromXPub(XPUB)
    const skipped = BIP32.memoizedFromXPub(XPUB, { skipVerification: true })
    expect(skipped.xPub).toBe(verified.xPub)
    expect(skipped.publicKey!.toString('hex')).toBe(verified.publicKey!.toString('hex'))
  })
})
