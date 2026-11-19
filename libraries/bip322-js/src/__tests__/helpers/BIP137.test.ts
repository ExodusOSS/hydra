import BIP137 from '../../helpers/BIP137.js'

const toBuffer = (base64: string) => Buffer.from(base64, 'base64')

describe('BIP137 Test', () => {
  it('Can distinguish between BIP-137 and BIP-322 signature', () => {
    // Arrange
    const bip137Sig = toBuffer(
      'IAtVrymJqo43BCt9f7Dhl6ET4Gg3SmhyvdlW6wn9iWc9PweD7tNM5+qw7xE9/bzlw/Et789AQ2F59YKEnSzQudo='
    )
    const bip322P2SHInP2WPKHSig = toBuffer(
      'AkgwRQIhAMd2wZSY3x0V9Kr/NClochoTXcgDaGl3OObOR17yx3QQAiBVWxqNSS+CKen7bmJTG6YfJjsggQ4Fa2RHKgBKrdQQ+gEhAxa5UDdQCHSQHfKQv14ybcYm1C9y6b12xAuukWzSnS+w'
    )
    const bip322P2WPKHSig = toBuffer(
      'AkcwRAIgM2gBAQqvZX15ZiysmKmQpDrG83avLIT492QBzLnQIxYCIBaTpOaD20qRlEylyxFSeEA2ba9YOixpX8z46TSDtS40ASECx/EgAxlkQpQ9hYjgGu6EBCPMVPwVIVJqO4XCsMvViHI='
    )
    const bip322P2TRSig = toBuffer(
      'AUHd69PrJQEv+oKTfZ8l+WROBHuy9HKrbFCJu7U1iK2iiEy1vMU5EfMtjc+VSHM7aU0SDbak5IUZRVno2P5mjSafAQ=='
    )

    // Act
    const bip137SigResult = BIP137.isBIP137Signature(bip137Sig)
    const bip322P2SHInP2WPKHSigResult = BIP137.isBIP137Signature(bip322P2SHInP2WPKHSig)
    const bip322P2WPKHSigResult = BIP137.isBIP137Signature(bip322P2WPKHSig)
    const bip322P2TRSigResult = BIP137.isBIP137Signature(bip322P2TRSig)

    // Assert
    expect(bip137SigResult).toBeTruthy()
    expect(bip322P2SHInP2WPKHSigResult).toBeFalsy()
    expect(bip322P2WPKHSigResult).toBeFalsy()
    expect(bip322P2TRSigResult).toBeFalsy()
  })

  it('Can derive public key from BIP-137 signature', () => {
    // Arrange
    const publicKey = Buffer.from(
      '02f7fb07050d858b3289c2a0305fbac1f5b18233798665c0cbfe133e018b57cafc',
      'hex'
    )
    const message = 'Hello World'
    const bip137Sig = toBuffer(
      'IAtVrymJqo43BCt9f7Dhl6ET4Gg3SmhyvdlW6wn9iWc9PweD7tNM5+qw7xE9/bzlw/Et789AQ2F59YKEnSzQudo='
    )

    // Act
    const publicKeyDerived = BIP137.derivePubKey(message, bip137Sig)

    // Assert
    expect(publicKeyDerived).toStrictEqual(publicKey)
  })

  it('Can derive public key from a segwit-flagged BIP-137 signature', () => {
    // Arrange
    const publicKey = Buffer.from(
      '02f7fb07050d858b3289c2a0305fbac1f5b18233798665c0cbfe133e018b57cafc',
      'hex'
    )
    const message = 'Hello World'
    // Same signature as the legacy case (header byte 0x20), with the header rewritten into the
    // P2WPKH segwit range (0x28 — same recovery id, still compressed). Flag bytes 35..42 are
    // within the valid 27..42 window and must derive the same public key rather than be rejected.
    const bip137SegwitSig = Buffer.from(
      'IAtVrymJqo43BCt9f7Dhl6ET4Gg3SmhyvdlW6wn9iWc9PweD7tNM5+qw7xE9/bzlw/Et789AQ2F59YKEnSzQudo=',
      'base64'
    )
    bip137SegwitSig[0] = 0x28

    // Act
    const publicKeyDerived = BIP137.derivePubKey(message, bip137SegwitSig)

    // Assert
    expect(publicKeyDerived).toStrictEqual(publicKey)
  })

  it('Throw when given invalid BIP-137 signature', () => {
    // Arrange
    const message = 'Hello World'
    const bip137Sig = Buffer.from(
      'IAtVrymJqo43BCt9f7Dhl6ET4Gg3SmhyvdlW6wn9iWc9PweD7tNM5+qw7xE9/bzlw/Et789AQ2F59YKEnSzQudo=',
      'base64'
    )
    // BIP-137 signature with extra or 1 less bytes
    const bip137SigTooLong = Buffer.concat([bip137Sig, Buffer.from([1])])
    const bip137SigTooShort = Buffer.from(bip137Sig).subarray(1)
    // Header bytes must be between 27 and 42 (both inclusive)
    const bip137Flag1A = Buffer.from(bip137Sig) // 26 — one below the valid range
    bip137Flag1A[0] = 0x1a
    // Header bytes 43..46 (flag bytes 16..19) were accepted until the range was tightened to
    // 0..15; assert both edges of that newly-rejected band now throw.
    const bip137Flag2B = Buffer.from(bip137Sig) // 43 — bottom of the newly-rejected band
    bip137Flag2B[0] = 0x2b
    const bip137Flag2E = Buffer.from(bip137Sig) // 46 — top of the newly-rejected band
    bip137Flag2E[0] = 0x2e
    const bip137Flag2F = Buffer.from(bip137Sig) // 47 — one above the old range
    bip137Flag2F[0] = 0x2f

    // Act
    const bip137SigTooLongResult = BIP137.derivePubKey.bind(BIP137, message, bip137SigTooLong)
    const bip137SigTooShortResult = BIP137.derivePubKey.bind(BIP137, message, bip137SigTooShort)
    const bip137Flag1AResult = BIP137.derivePubKey.bind(BIP137, message, bip137Flag1A)
    const bip137Flag2BResult = BIP137.derivePubKey.bind(BIP137, message, bip137Flag2B)
    const bip137Flag2EResult = BIP137.derivePubKey.bind(BIP137, message, bip137Flag2E)
    const bip137Flag2FResult = BIP137.derivePubKey.bind(BIP137, message, bip137Flag2F)

    // Assert
    expect(bip137SigTooLongResult).toThrow('Invalid signature length')
    expect(bip137SigTooShortResult).toThrow('Invalid signature length')
    expect(bip137Flag1AResult).toThrow('Invalid signature parameter')
    expect(bip137Flag2BResult).toThrow('Invalid signature parameter')
    expect(bip137Flag2EResult).toThrow('Invalid signature parameter')
    expect(bip137Flag2FResult).toThrow('Invalid signature parameter')
  })
})
