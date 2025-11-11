// Import module to be tested
import BIP137 from '../src/helpers/BIP137.js'

describe('BIP137 Test', () => {
  it('Can distinguish between BIP-137 and BIP-322 signature', () => {
    // Arrange
    const bip137Sig =
      'IAtVrymJqo43BCt9f7Dhl6ET4Gg3SmhyvdlW6wn9iWc9PweD7tNM5+qw7xE9/bzlw/Et789AQ2F59YKEnSzQudo='
    const bip322P2SHInP2WPKHSig =
      'AkgwRQIhAMd2wZSY3x0V9Kr/NClochoTXcgDaGl3OObOR17yx3QQAiBVWxqNSS+CKen7bmJTG6YfJjsggQ4Fa2RHKgBKrdQQ+gEhAxa5UDdQCHSQHfKQv14ybcYm1C9y6b12xAuukWzSnS+w'
    const bip322P2WPKHSig =
      'AkcwRAIgM2gBAQqvZX15ZiysmKmQpDrG83avLIT492QBzLnQIxYCIBaTpOaD20qRlEylyxFSeEA2ba9YOixpX8z46TSDtS40ASECx/EgAxlkQpQ9hYjgGu6EBCPMVPwVIVJqO4XCsMvViHI='
    const bip322P2TRSig =
      'AUHd69PrJQEv+oKTfZ8l+WROBHuy9HKrbFCJu7U1iK2iiEy1vMU5EfMtjc+VSHM7aU0SDbak5IUZRVno2P5mjSafAQ=='

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
    const bip137Sig =
      'IAtVrymJqo43BCt9f7Dhl6ET4Gg3SmhyvdlW6wn9iWc9PweD7tNM5+qw7xE9/bzlw/Et789AQ2F59YKEnSzQudo='

    // Act
    const publicKeyDerived = BIP137.derivePubKey(message, bip137Sig)

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
    // Header bytes must be between 27 and 46 (both inclusive)
    const bip137Flag1A = Buffer.from(bip137Sig) // 26
    bip137Flag1A[0] = 0x1a
    const bip137Flag2F = Buffer.from(bip137Sig) // 47
    bip137Flag2F[0] = 0x2f

    // Act
    const bip137SigTooLongResult = BIP137.derivePubKey.bind(BIP137, message, bip137SigTooLong)
    const bip137SigTooShortResult = BIP137.derivePubKey.bind(BIP137, message, bip137SigTooShort)
    const bip137Flag1AResult = BIP137.derivePubKey.bind(BIP137, message, bip137Flag1A)
    const bip137Flag2FResult = BIP137.derivePubKey.bind(BIP137, message, bip137Flag2F)

    // Assert
    expect(bip137SigTooLongResult).toThrow('Invalid signature length')
    expect(bip137SigTooShortResult).toThrow('Invalid signature length')
    expect(bip137Flag1AResult).toThrow('Invalid signature parameter')
    expect(bip137Flag2FResult).toThrow('Invalid signature parameter')
  })
})
