import * as bitcoin from '@exodus/bitcoinjs'
import * as ecc from '@exodus/crypto/tiny-secp256k1-compat'
import { ECPairFactory } from 'ecpair'

import BIP322 from '../BIP322.js'
import Verifier from '../Verifier.js'
import Witness from './src/helpers/Witness.js'

const ECPair = ECPairFactory(ecc)

const toBuffer = (base64: string) => Buffer.from(base64, 'base64')

describe('Verifier Test', () => {
  it('Throws when signature is not a Buffer', async () => {
    const address = 'bc1q9vza2e8x573nczrlzms0wvx3gsqjx7vavgkx0l'
    const message = 'Hello World'
    const signatureBase64 =
      'AkcwRAIgM2gBAQqvZX15ZiysmKmQpDrG83avLIT492QBzLnQIxYCIBaTpOaD20qRlEylyxFSeEA2ba9YOixpX8z46TSDtS40ASECx/EgAxlkQpQ9hYjgGu6EBCPMVPwVIVJqO4XCsMvViHI='

    await expect(
      Verifier.verifySignature(address, message, signatureBase64 as any as Buffer)
    ).rejects.toThrow('signature must be a Buffer')
  })

  it('Can verify legacy P2PKH signature', async () => {
    // Arrange
    // Test vector copied from https://github.com/bitcoinjs/bitcoinjs-message/blob/c43430f4c03c292c719e7801e425d887cbdf7464/README.md?plain=1#L21
    const address = '1F3sAm6ZtwLAUnj7d38pGFxtP3RVEvtsbV'
    const addressTestnet = 'muZpTpBYhxmRFuCjLc7C6BBDF32C8XVJUi'
    const addressWrong = '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2'
    const addressWrongTestnet = 'mipcBbFg9gMiCh81Kj8tqqdgoZub1ZJRfn'
    const message = 'This is an example of a signed message.'
    const messageWrong = ''
    const signature =
      'H9L5yLFjti0QTHhPyFrZCT1V/MMnBtXKmoiKDZ78NDBjERki6ZTQZdSMCtkgoNmp17By9ItJr8o7ChX0XxY91nk='

    // Act
    const resultCorrect = await Verifier.verifySignature(address, message, toBuffer(signature)) // Everything correct
    const resultCorrectTestnet = await Verifier.verifySignature(
      addressTestnet,
      message,
      toBuffer(signature)
    ) // Everything correct
    const resultWrongMessage = await Verifier.verifySignature(
      address,
      messageWrong,
      toBuffer(signature)
    ) // Wrong message - should be false
    const resultWrongMessageTestnet = await Verifier.verifySignature(
      addressTestnet,
      messageWrong,
      toBuffer(signature)
    ) // Wrong message - should be false
    const resultWrongAddress = await Verifier.verifySignature(
      addressWrong,
      message,
      toBuffer(signature)
    ) // Wrong address - should be false
    const resultWrongAddressTestnet = await Verifier.verifySignature(
      addressWrongTestnet,
      message,
      toBuffer(signature)
    ) // Wrong address - should be false

    // Assert
    expect(resultCorrect).toBeTruthy()
    expect(resultCorrectTestnet).toBeTruthy()
    expect(resultWrongMessage).toBeFalsy()
    expect(resultWrongMessageTestnet).toBeFalsy()
    expect(resultWrongAddress).toBeFalsy()
    expect(resultWrongAddressTestnet).toBeFalsy()
  })

  it('Can verify legacy BIP-137 signature from P2SH-P2WPKH, P2WPKH, and P2TR address', async () => {
    // Arrange
    const message = 'Hello World'
    const signature =
      'IAtVrymJqo43BCt9f7Dhl6ET4Gg3SmhyvdlW6wn9iWc9PweD7tNM5+qw7xE9/bzlw/Et789AQ2F59YKEnSzQudo=' // Signed by public key "02f7fb07050d858b3289c2a0305fbac1f5b18233798665c0cbfe133e018b57cafc"
    // Addresses derived from public key "02f7fb07050d858b3289c2a0305fbac1f5b18233798665c0cbfe133e018b57cafc"
    const p2pkhMainnetValid = '1QDZfWJTVXqHFmJFRkyrnidvHyPyG5bynY'
    const p2pkhTestnetValid = 'n4jWxZPSJZGY2sms9KxEcdrF9xzgEbrHHj'
    const p2shMainnetValid = '36mTiayp1ZCcMr8t8KDdnVGSiz7Pd1cNie'
    const p2shTestnetValid = '2MxKfnKuqd1hxZdmRoSqWQSFhwLKZRQ3NpZ'
    const p2wpkhMainnetValid = 'bc1ql64jd2pewssuuehu6g7kh6ud54amq5n8t95eeq'
    const p2wpkhTestnetValid = 'tb1ql64jd2pewssuuehu6g7kh6ud54amq5n8pr02zn'
    const p2trMainnetValid = 'bc1p5tm5kzqpflhxkkzhl7x4f0nnfygp38hxz4erdq4ffhpqgmgket9s34fgdd'
    const p2trTestnetValid = 'tb1p5tm5kzqpflhxkkzhl7x4f0nnfygp38hxz4erdq4ffhpqgmgket9sxal8hz'
    // Random address that should fail validation
    const p2pkhMainnetInvalid = '1F3sAm6ZtwLAUnj7d38pGFxtP3RVEvtsbV'
    const p2pkhTestnetInvalid = 'muZpTpBYhxmRFuCjLc7C6BBDF32C8XVJUi'
    const p2shMainnetInvalid = '3HSVzEhCFuH9Z3wvoWTexy7BMVVp3PjS6f'
    const p2shTestnetInvalid = '2MzQwSSnBHWHqSAqtTVQ6v47XtaisrJa1Vc'
    const p2wpkhMainnetInvalid = 'bc1q9vza2e8x573nczrlzms0wvx3gsqjx7vavgkx0l'
    const p2wpkhTestnetInvalid = 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx'
    const p2trMainnetInvalid = 'bc1ppv609nr0vr25u07u95waq5lucwfm6tde4nydujnu8npg4q75mr5sxq8lt3'
    const p2trTestnetInvalid = 'tb1p000273lqsqqfw2a6h2vqxr2tll4wgtv7zu8a30rz4mhree8q5jzq8cjtyp'
    // Invalid address
    const invalidAddress = 'bc1apv609nr0vr25u07u95waq5lucwfm6tde4nydujnu8npg4q75mr5sxq8lt3'
    const invalidAddressTestnet = 'tb1a000273lqsqqfw2a6h2vqxr2tll4wgtv7zu8a30rz4mhree8q5jzq8cjtyp'

    // Act
    const signatureBuffer = toBuffer(signature)
    const p2pkhMainnetValidResult = await Verifier.verifySignature(
      p2pkhMainnetValid,
      message,
      signatureBuffer
    )
    const p2pkhTestnetValidResult = await Verifier.verifySignature(
      p2pkhTestnetValid,
      message,
      signatureBuffer
    )
    const p2shMainnetValidResult = await Verifier.verifySignature(
      p2shMainnetValid,
      message,
      signatureBuffer
    )
    const p2shTestnetValidResult = await Verifier.verifySignature(
      p2shTestnetValid,
      message,
      signatureBuffer
    )
    const p2wpkhMainnetValidResult = await Verifier.verifySignature(
      p2wpkhMainnetValid,
      message,
      signatureBuffer
    )
    const p2wpkhTestnetValidResult = await Verifier.verifySignature(
      p2wpkhTestnetValid,
      message,
      signatureBuffer
    )
    const p2trMainnetValidResult = await Verifier.verifySignature(
      p2trMainnetValid,
      message,
      signatureBuffer
    )
    const p2trTestnetValidResult = await Verifier.verifySignature(
      p2trTestnetValid,
      message,
      signatureBuffer
    )

    const p2pkhMainnetInvalidResult = await Verifier.verifySignature(
      p2pkhMainnetInvalid,
      message,
      signatureBuffer
    )
    const p2pkhTestnetInvalidResult = await Verifier.verifySignature(
      p2pkhTestnetInvalid,
      message,
      signatureBuffer
    )
    const p2shMainnetInvalidResult = await Verifier.verifySignature(
      p2shMainnetInvalid,
      message,
      signatureBuffer
    )
    const p2shTestnetInvalidResult = await Verifier.verifySignature(
      p2shTestnetInvalid,
      message,
      signatureBuffer
    )
    const p2wpkhMainnetInvalidResult = await Verifier.verifySignature(
      p2wpkhMainnetInvalid,
      message,
      signatureBuffer
    )
    const p2wpkhTestnetInvalidResult = await Verifier.verifySignature(
      p2wpkhTestnetInvalid,
      message,
      signatureBuffer
    )
    const p2trMainnetInvalidResult = await Verifier.verifySignature(
      p2trMainnetInvalid,
      message,
      signatureBuffer
    )
    const p2trTestnetInvalidResult = await Verifier.verifySignature(
      p2trTestnetInvalid,
      message,
      signatureBuffer
    )

    const invalidAddressResult = await Verifier.verifySignature(
      invalidAddress,
      message,
      signatureBuffer
    )
    const invalidAddressTestnetResult = await Verifier.verifySignature(
      invalidAddressTestnet,
      message,
      signatureBuffer
    )

    // Assert
    expect(p2pkhMainnetValidResult).toBeTruthy()
    expect(p2pkhTestnetValidResult).toBeTruthy()
    expect(p2shMainnetValidResult).toBeTruthy()
    expect(p2shTestnetValidResult).toBeTruthy()
    expect(p2wpkhMainnetValidResult).toBeTruthy()
    expect(p2wpkhTestnetValidResult).toBeTruthy()
    expect(p2trMainnetValidResult).toBeTruthy()
    expect(p2trTestnetValidResult).toBeTruthy()

    expect(p2pkhMainnetInvalidResult).toBeFalsy()
    expect(p2pkhTestnetInvalidResult).toBeFalsy()
    expect(p2shMainnetInvalidResult).toBeFalsy()
    expect(p2shTestnetInvalidResult).toBeFalsy()
    expect(p2wpkhMainnetInvalidResult).toBeFalsy()
    expect(p2wpkhTestnetInvalidResult).toBeFalsy()
    expect(p2trMainnetInvalidResult).toBeFalsy()
    expect(p2trTestnetInvalidResult).toBeFalsy()

    expect(invalidAddressResult).toBeFalsy()
    expect(invalidAddressTestnetResult).toBeFalsy()
  })

  it('Recovers the BIP-137 signer from compact r||s even when it also parses as DER', async () => {
    // The 64 bytes after the header were built as a DER signature (30 3e 02 20 <32-byte r> 02 1a
    // <26-byte s>) made with the crafter's own key. Bitcoin Core reads them only as compact r||s,
    // which recovers a different signer. P2PKH and P2WPKH go through separate recovery code.
    const message = 'Hello World'
    const signature = toBuffer(
      'IDA+AiAHS6oess6AVJ8HX5xD6pyOlJKt2Upu9bcxpVffQysXJwIadxSXa7sM+uQ2JgV+ExBHm1dzXUf2qceby3A='
    )
    const compactSignerP2PKH = '1D5ghb5pkfRPZPHfhrEVsB2puJ9nvwkN7i'
    const compactSignerP2WPKH = 'bc1qsjz9q859zdkrldtuc5pcclmss0pxaapf6q3k77'
    const derSignerP2PKH = '16URrNHapNrwobne75uTNvR4mAyWdfLWb4'
    const derSignerP2WPKH = 'bc1q8syf433n4ryw72t79k7h0q8rqy6489jdwcfw4c'

    await expect(Verifier.verifySignature(compactSignerP2PKH, message, signature)).resolves.toBe(
      true
    )
    await expect(Verifier.verifySignature(compactSignerP2WPKH, message, signature)).resolves.toBe(
      true
    )
    await expect(Verifier.verifySignature(derSignerP2PKH, message, signature)).resolves.toBe(false)
    await expect(Verifier.verifySignature(derSignerP2WPKH, message, signature)).resolves.toBe(false)
  })

  it('Can verify and falsify BIP-322 signature for P2SH-P2WPKH address', async () => {
    // Arrange
    // Constants
    const privateKey = 'KwTbAxmBXjoZM3bzbXixEr9nxLhyYSM4vp2swet58i19bw9sqk5z' // Private key of "3HSVzEhCFuH9Z3wvoWTexy7BMVVp3PjS6f", also serve to test public key that begins with 0x03
    const address = '3HSVzEhCFuH9Z3wvoWTexy7BMVVp3PjS6f' // Derived from the private key above
    const addressTestnet = '2N8zi3ydDsMnVkqaUUe5Xav6SZqhyqEduap' // Derived from the private key above
    const addressWrong = '342ftSRCvFHfCeFFBuz4xwbeqnDw6BGUey'
    const addressTestnetWrong = '2MzQwSSnBHWHqSAqtTVQ6v47XtaisrJa1Vc'
    const messageWrong = ''
    const messageHelloWorld = 'Hello World'
    // Initialize private key used to sign the transaction
    const testPrivateKey = ECPair.fromWIF(privateKey)
    // Obtain the script public key
    const scriptPubKey = bitcoin.payments.p2sh({
      address,
    }).output!
    // Derive the P2SH-P2WPKH redeemScript from the corresponding hashed public key
    const redeemScript = bitcoin.payments.p2wpkh({
      hash: bitcoin.crypto.hash160(testPrivateKey.publicKey),
    }).output!
    // Draft a toSpend transaction with messageHelloWorld
    const toSpendTx = BIP322.buildToSpendTx(messageHelloWorld, scriptPubKey)
    // Draft a toSign transaction that spends toSpend transaction
    const toSignTx = BIP322.buildToSignTx(toSpendTx.getId(), redeemScript, true)
    // Sign the toSign transaction
    const toSignTxSigned = toSignTx.signAllInputs(testPrivateKey).finalizeAllInputs()
    // Extract the signature
    const signatureBuffer = toBuffer(BIP322.encodeWitness(toSignTxSigned))

    // Act
    const resultCorrect = await Verifier.verifySignature(
      address,
      messageHelloWorld,
      signatureBuffer
    ) // Everything correct
    const resultCorrectTestnet = await Verifier.verifySignature(
      addressTestnet,
      messageHelloWorld,
      signatureBuffer
    ) // Everything correct
    const resultWrongMessage = await Verifier.verifySignature(
      address,
      messageWrong,
      signatureBuffer
    ) // Wrong message - should be false
    const resultWrongMessageTestnet = await Verifier.verifySignature(
      addressTestnet,
      messageWrong,
      signatureBuffer
    ) // Wrong message - should be false
    const resultWrongAddress = await Verifier.verifySignature(
      addressWrong,
      messageHelloWorld,
      signatureBuffer
    ) // Wrong address - should be false
    const resultWrongAddressTestnet = await Verifier.verifySignature(
      addressTestnetWrong,
      messageHelloWorld,
      signatureBuffer
    ) // Wrong address - should be false

    // Assert
    expect(resultCorrect).toBeTruthy()
    expect(resultCorrectTestnet).toBeTruthy()
    expect(resultWrongMessage).toBeFalsy()
    expect(resultWrongMessageTestnet).toBeFalsy()
    expect(resultWrongAddress).toBeFalsy()
    expect(resultWrongAddressTestnet).toBeFalsy()
  })

  it('Can verify and falsify BIP-322 signature for P2WPKH address', async () => {
    // Arrange
    // Test vectors listed at https://github.com/bitcoin/bips/blob/master/bip-0322.mediawiki#user-content-Test_vectors
    const address = 'bc1q9vza2e8x573nczrlzms0wvx3gsqjx7vavgkx0l'
    const addressTestnet = 'tb1q9vza2e8x573nczrlzms0wvx3gsqjx7vaxwd45v'
    const addressWrong = 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq'
    const addressWrongTestnet = 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx'
    const messageEmpty = ''
    const messageHelloWorld = 'Hello World'
    const signatureEmpty =
      'AkcwRAIgM2gBAQqvZX15ZiysmKmQpDrG83avLIT492QBzLnQIxYCIBaTpOaD20qRlEylyxFSeEA2ba9YOixpX8z46TSDtS40ASECx/EgAxlkQpQ9hYjgGu6EBCPMVPwVIVJqO4XCsMvViHI='
    const signatureHelloWorld =
      'AkcwRAIgZRfIY3p7/DoVTty6YZbWS71bc5Vct9p9Fia83eRmw2QCICK/ENGfwLtptFluMGs2KsqoNSk89pO7F29zJLUx9a/sASECx/EgAxlkQpQ9hYjgGu6EBCPMVPwVIVJqO4XCsMvViHI='
    // Additional test vector listed at https://github.com/bitcoin/bitcoin/blob/29b28d07fa958b89e1c7916fda5d8654474cf495/src/test/util_tests.cpp#L2713
    const signatureHelloWorldAlt =
      'AkgwRQIhAOzyynlqt93lOKJr+wmmxIens//zPzl9tqIOua93wO6MAiBi5n5EyAcPScOjf1lAqIUIQtr3zKNeavYabHyR8eGhowEhAsfxIAMZZEKUPYWI4BruhAQjzFT8FSFSajuFwrDL1Yhy'

    // Act
    const signatureEmptyBuffer = toBuffer(signatureEmpty)
    const signatureHelloWorldBuffer = toBuffer(signatureHelloWorld)
    const signatureHelloWorldAltBuffer = toBuffer(signatureHelloWorldAlt)
    // Correct addresses and correct signature
    const resultEmptyValid = await Verifier.verifySignature(
      address,
      messageEmpty,
      signatureEmptyBuffer
    )
    const resultEmptyValidTestnet = await Verifier.verifySignature(
      addressTestnet,
      messageEmpty,
      signatureEmptyBuffer
    )
    const resultHelloWorldValid = await Verifier.verifySignature(
      address,
      messageHelloWorld,
      signatureHelloWorldBuffer
    )
    const resultHelloWorldValidTestnet = await Verifier.verifySignature(
      addressTestnet,
      messageHelloWorld,
      signatureHelloWorldBuffer
    )
    const resultHelloWorldValidII = await Verifier.verifySignature(
      address,
      messageHelloWorld,
      signatureHelloWorldAltBuffer
    )
    const resultHelloWorldValidIITestnet = await Verifier.verifySignature(
      addressTestnet,
      messageHelloWorld,
      signatureHelloWorldAltBuffer
    )
    // Correct addresses but incorrect signature
    const resultHelloWorldInvalidSig = await Verifier.verifySignature(
      address,
      messageEmpty,
      signatureHelloWorldBuffer
    ) // Mixed up the signature and message - should be false
    const resultHelloWorldInvalidSigTestnet = await Verifier.verifySignature(
      addressTestnet,
      messageEmpty,
      signatureHelloWorldBuffer
    ) // Mixed up the signature and message - should be false
    const resultEmptyInvalidSig = await Verifier.verifySignature(
      address,
      messageHelloWorld,
      signatureEmptyBuffer
    ) // Mixed up the signature and message - should be false
    const resultEmptyInvalidSigTestnet = await Verifier.verifySignature(
      addressTestnet,
      messageHelloWorld,
      signatureEmptyBuffer
    ) // Mixed up the signature and message - should be false
    // Incorrect addresses
    const resultEmptyInvalidAddress = await Verifier.verifySignature(
      addressWrong,
      messageEmpty,
      signatureEmptyBuffer
    ) // Wrong address - should be false
    const resultEmptyInvalidAddressTestnet = await Verifier.verifySignature(
      addressWrongTestnet,
      messageEmpty,
      signatureEmptyBuffer
    ) // Wrong address - should be false
    const resultHelloWorldInvalidAddress = await Verifier.verifySignature(
      addressWrong,
      messageHelloWorld,
      signatureHelloWorldBuffer
    ) // Wrong address - should be false
    const resultHelloWorldInvalidAddressTestnet = await Verifier.verifySignature(
      addressWrongTestnet,
      messageHelloWorld,
      signatureHelloWorldBuffer
    ) // Wrong address - should be false

    // Assert
    expect(resultEmptyValid).toBeTruthy()
    expect(resultEmptyValidTestnet).toBeTruthy()
    expect(resultHelloWorldValid).toBeTruthy()
    expect(resultHelloWorldValidTestnet).toBeTruthy()
    expect(resultHelloWorldValidII).toBeTruthy()
    expect(resultHelloWorldValidIITestnet).toBeTruthy()
    expect(resultHelloWorldInvalidSig).toBeFalsy()
    expect(resultHelloWorldInvalidSigTestnet).toBeFalsy()
    expect(resultEmptyInvalidSig).toBeFalsy()
    expect(resultEmptyInvalidSigTestnet).toBeFalsy()
    expect(resultEmptyInvalidAddress).toBeFalsy()
    expect(resultEmptyInvalidAddressTestnet).toBeFalsy()
    expect(resultHelloWorldInvalidAddress).toBeFalsy()
    expect(resultHelloWorldInvalidAddressTestnet).toBeFalsy()
  })

  it('Can verify and falsify BIP-322 signature for single-key-spend P2TR address using SIGHASH_ALL flag', async () => {
    // Arrange
    // Test vector listed at https://github.com/bitcoin/bitcoin/blob/29b28d07fa958b89e1c7916fda5d8654474cf495/src/test/util_tests.cpp#L2747
    const address = 'bc1ppv609nr0vr25u07u95waq5lucwfm6tde4nydujnu8npg4q75mr5sxq8lt3'
    const addressTestnet = 'tb1ppv609nr0vr25u07u95waq5lucwfm6tde4nydujnu8npg4q75mr5s3g3s37'
    const addressWrong = 'bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297'
    const addressWrongTestnet = 'tb1p000273lqsqqfw2a6h2vqxr2tll4wgtv7zu8a30rz4mhree8q5jzq8cjtyp'
    const messageWrong = ''
    const messageHelloWorld = 'Hello World'
    const signatureHelloWorld =
      'AUHd69PrJQEv+oKTfZ8l+WROBHuy9HKrbFCJu7U1iK2iiEy1vMU5EfMtjc+VSHM7aU0SDbak5IUZRVno2P5mjSafAQ=='

    // Act
    const signatureHelloWorldBuffer = toBuffer(signatureHelloWorld)
    const resultCorrect = await Verifier.verifySignature(
      address,
      messageHelloWorld,
      signatureHelloWorldBuffer
    ) // Everything correct
    const resultCorrectTestnet = await Verifier.verifySignature(
      addressTestnet,
      messageHelloWorld,
      signatureHelloWorldBuffer
    ) // Everything correct
    const resultWrongMessage = await Verifier.verifySignature(
      address,
      messageWrong,
      signatureHelloWorldBuffer
    ) // Wrong message - should be false
    const resultWrongMessageTestnet = await Verifier.verifySignature(
      addressTestnet,
      messageWrong,
      signatureHelloWorldBuffer
    ) // Wrong message - should be false
    const resultWrongAddress = await Verifier.verifySignature(
      addressWrong,
      messageHelloWorld,
      signatureHelloWorldBuffer
    ) // Wrong address - should be false
    const resultWrongAddressTestnet = await Verifier.verifySignature(
      addressWrongTestnet,
      messageHelloWorld,
      signatureHelloWorldBuffer
    ) // Wrong address - should be false

    // Assert
    expect(resultCorrect).toBeTruthy()
    expect(resultCorrectTestnet).toBeTruthy()
    expect(resultWrongMessage).toBeFalsy()
    expect(resultWrongMessageTestnet).toBeFalsy()
    expect(resultWrongAddress).toBeFalsy()
    expect(resultWrongAddressTestnet).toBeFalsy()
  })

  it('Can verify and falsify BIP-322 signature for single-key-spend P2TR address using SIGHASH_DEFAULT flag', async () => {
    // Arrange
    const privateKey = 'L3VFeEujGtevx9w18HD1fhRbCH67Az2dpCymeRE1SoPK6XQtaN2k' // Private key of bc1ppv609nr0vr25u07u95waq5lucwfm6tde4nydujnu8npg4q75mr5sxq8lt3
    const address = 'bc1ppv609nr0vr25u07u95waq5lucwfm6tde4nydujnu8npg4q75mr5sxq8lt3'
    const addressTestnet = 'tb1ppv609nr0vr25u07u95waq5lucwfm6tde4nydujnu8npg4q75mr5s3g3s37'
    const addressWrong = 'bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297'
    const addressWrongTestnet = 'tb1p000273lqsqqfw2a6h2vqxr2tll4wgtv7zu8a30rz4mhree8q5jzq8cjtyp'
    const messageWrong = ''
    const messageHelloWorld = 'Hello World'
    // Initialize private key used to sign the transaction
    const testPrivateKey = ECPair.fromWIF(privateKey)
    // Extract the taproot internal public key
    const internalPublicKey = testPrivateKey.publicKey.subarray(1, 33)
    // Tweak the private key for signing, since the output and address uses tweaked key
    // Reference: https://github.com/bitcoinjs/bitcoinjs-lib/blob/1a9119b53bcea4b83a6aa8b948f0e6370209b1b4/test/integration/taproot.spec.ts#L55
    const testPrivateKeyTweaked = testPrivateKey.tweak(
      bitcoin.crypto.taggedHash('TapTweak', testPrivateKey.publicKey.subarray(1, 33))
    )
    // Obtain the script public key
    const scriptPubKey = bitcoin.payments.p2tr({
      address,
    }).output!
    // Draft a toSpend transaction with messageHelloWorld
    const toSpendTx = BIP322.buildToSpendTx(messageHelloWorld, scriptPubKey)
    // Draft a toSign transaction that spends toSpend transaction
    const toSignTx = BIP322.buildToSignTx(toSpendTx.getId(), scriptPubKey, false, internalPublicKey)
    // Sign the toSign transaction
    const toSignTxSigned = toSignTx
      .signAllInputs(testPrivateKeyTweaked, [bitcoin.Transaction.SIGHASH_DEFAULT])
      .finalizeAllInputs()
    // Extract the signature
    const signatureBuffer = toBuffer(BIP322.encodeWitness(toSignTxSigned))

    // Act
    const resultCorrect = await Verifier.verifySignature(
      address,
      messageHelloWorld,
      signatureBuffer
    ) // Everything correct
    const resultCorrectTestnet = await Verifier.verifySignature(
      addressTestnet,
      messageHelloWorld,
      signatureBuffer
    ) // Everything correct
    const resultWrongMessage = await Verifier.verifySignature(
      address,
      messageWrong,
      signatureBuffer
    ) // Wrong message - should be false
    const resultWrongMessageTestnet = await Verifier.verifySignature(
      addressTestnet,
      messageWrong,
      signatureBuffer
    ) // Wrong message - should be false
    const resultWrongAddress = await Verifier.verifySignature(
      addressWrong,
      messageHelloWorld,
      signatureBuffer
    ) // Wrong address - should be false
    const resultWrongAddressTestnet = await Verifier.verifySignature(
      addressWrongTestnet,
      messageHelloWorld,
      signatureBuffer
    ) // Wrong address - should be false

    // Assert
    expect(resultCorrect).toBeTruthy()
    expect(resultCorrectTestnet).toBeTruthy()
    expect(resultWrongMessage).toBeFalsy()
    expect(resultWrongMessageTestnet).toBeFalsy()
    expect(resultWrongAddress).toBeFalsy()
    expect(resultWrongAddressTestnet).toBeFalsy()
  })

  it('Refuse to verify P2WSH transaction', async () => {
    // Arrange
    // Taken from transaction 4221ff28411a87e6d412458689c471b875dd43aca7d02c7fb7c7331855581434
    const address = 'bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3'
    const message = '' // Does not actually matter, it should throw due to the P2WSH address anyway
    const signature =
      'ApAzMDQ1MDIyMTAwYzkzMWY5YzAxZmU2ZjRlNGY2N2M1NTY0NDc2NDY1OTI4OWQ4ZDRjYzcyM2ZlODJkZDJiOTdmYmZkYTA2NGJlYzAyMjAwZGZkNTg2ZjU4YzllZGJhODc0ZTBjZWY2NmU5ZmU5MWU3YWE3YTZjZGRkNmExZjU3MmVmYjY2ZmU5Y2FlZjJlMDFGMjEwMjc5YmU2NjdlZjlkY2JiYWM1NWEwNjI5NWNlODcwYjA3MDI5YmZjZGIyZGNlMjhkOTU5ZjI4MTViMTZmODE3OThhYw=='

    // Assert
    await expect(Verifier.verifySignature(address, message, toBuffer(signature))).rejects.toThrow(
      'Only P2WPKH, P2SH-P2WPKH, and single-key-spend P2TR BIP-322 verification is supported. Unsupported address is provided.'
    )
  })

  it('Refuse to verify script-spend P2TR transaction', async () => {
    // Arrange
    // Taken from transaction d1042c9db36af59586e5681feeace356e85599a8fc0000cc50e263186a9c2276 which is an ordinal inscription transaction
    const address = 'bc1p3r88nsysd8sv555nur4h85wdupa5z0xpcgcdjxy5up30re8gcneswrkwkv'
    const message = '' // Does not actually matter, it should throw due to the script-path spend included in the witness stack
    const signature =
      'A4AxODdkNTJkNGVkNDQ2OThlY2M5NjJlZDc0ZDdmODIyODIwNDc1YTc1NjdjMTViYmFkOGY5MWNlOTZkMGYxMzJkMmQxM2U0MzA3OWFlNzAwMTE5YzkxYTQ2MjA4Yzk5NWUzYTE4YjUzNjYzNjhkZDA0NDUwYzNmZjU2NTIyMWQyY+AyMDVkZTgxNTRlNzBkNmFmNTI5MDZhNGM0ZDc4OThiMDE4MGRlNWRiOGI3Y2Q0NGNiZDI3Y2RkZmY3NzUxY2ViYzdhYzAwNjMwMzZmNzI2NDAxMDExODc0NjU3ODc0MmY3MDZjNjE2OTZlM2I2MzY4NjE3MjczNjU3NDNkNzU3NDY2MmQzODAwMmE3YjIyNzAyMjNhMjI3MzZlNzMyMjJjMjI2ZjcwMjIzYTIyNzI2NTY3MjIyYzIyNmU2MTZkNjUyMjNhMjIzNjMzMzEzMjM4MmU3MzYxNzQ3MzIyN2Q2OEJjMDVkZTgxNTRlNzBkNmFmNTI5MDZhNGM0ZDc4OThiMDE4MGRlNWRiOGI3Y2Q0NGNiZDI3Y2RkZmY3NzUxY2ViYzc='

    // Act

    const promise = Verifier.verifySignature(address, message, toBuffer(signature))
    // Assert
    await expect(promise).rejects.toThrow(
      'BIP-322 verification from script-spend P2TR is unsupported.'
    )
  })

  it('Reject verification from malformed address', async () => {
    // Arrange
    const malformP2PKH = '1F3sAm6ZtwLAUnj7d38pGFxtP3RVEvtsbV' + 'M'
    const malformP2WPKHInP2SH = '37qyp7jQAzqb2rCBpMvVtLDuuzKAUCVnJb' + 'M'
    const malformedP2WPKH = 'bc1q9vza2e8x573nczrlzms0wvx3gsqjx7vavgkx0l' + 'm'
    const malformedP2TR = 'bc1ppv609nr0vr25u07u95waq5lucwfm6tde4nydujnu8npg4q75mr5sxq8lt3' + 'm'
    const message = '' // Does not actually matter, it should throw due to the malformed address
    const signatureP2PKH =
      'H9L5yLFjti0QTHhPyFrZCT1V/MMnBtXKmoiKDZ78NDBjERki6ZTQZdSMCtkgoNmp17By9ItJr8o7ChX0XxY91nk=' // Correctly encoded P2PKH signature
    const signatureP2WPKH =
      'AkcwRAIgM2gBAQqvZX15ZiysmKmQpDrG83avLIT492QBzLnQIxYCIBaTpOaD20qRlEylyxFSeEA2ba9YOixpX8z46TSDtS40ASECx/EgAxlkQpQ9hYjgGu6EBCPMVPwVIVJqO4XCsMvViHI=' // Correctly encoded P2WPKH signature
    const signatureP2TR =
      'AUHd69PrJQEv+oKTfZ8l+WROBHuy9HKrbFCJu7U1iK2iiEy1vMU5EfMtjc+VSHM7aU0SDbak5IUZRVno2P5mjSafAQ==' // Correctly encoded P2TR signature

    // Act
    const resultP2PKH = Verifier.verifySignature(malformP2PKH, message, toBuffer(signatureP2PKH))
    const resultP2WPKHInP2SH = Verifier.verifySignature(
      malformP2WPKHInP2SH,
      message,
      toBuffer(signatureP2WPKH)
    )
    const resultP2WPKH = Verifier.verifySignature(
      malformedP2WPKH,
      message,
      toBuffer(signatureP2WPKH)
    )
    const resultP2Tr = Verifier.verifySignature(malformedP2TR, message, toBuffer(signatureP2TR))

    // Assert
    await expect(resultP2PKH).rejects.toThrow() // Throw by bitcoinjs-message library
    await expect(resultP2WPKHInP2SH).rejects.toThrow() // Throw by bitcoinjs-lib
    await expect(resultP2WPKH).rejects.toThrow() // Throw by helper/Address
    await expect(resultP2Tr).rejects.toThrow() // Throw by helper/Address
  })

  it('Reject Schnorr signature with incorrect length', async () => {
    // Arrange
    // Test vector listed at https://github.com/bitcoin/bitcoin/blob/29b28d07fa958b89e1c7916fda5d8654474cf495/src/test/util_tests.cpp#L2747
    const address = 'bc1ppv609nr0vr25u07u95waq5lucwfm6tde4nydujnu8npg4q75mr5sxq8lt3'
    const messageHelloWorld = 'Hello World'
    const signatureHelloWorld =
      'AUHd69PrJQEv+oKTfZ8l+WROBHuy9HKrbFCJu7U1iK2iiEy1vMU5EfMtjc+VSHM7aU0SDbak5IUZRVno2P5mjSafAQ=='
    // Deserialize the signature
    const signatureHelloWorldDeserialized = Witness.deserialize(signatureHelloWorld)[0]!
    // Append an extra byte at the end of signatureHelloWorld
    const signatureHelloWorldExtraByte = Buffer.concat([
      signatureHelloWorldDeserialized,
      Buffer.from([0xff]),
    ])
    // Serialize the modified signature into base64
    const signatureHelloWorldExtraByteSerialized = Witness.serialize([signatureHelloWorldExtraByte])

    // Act
    const result = Verifier.verifySignature(
      address,
      messageHelloWorld,
      toBuffer(signatureHelloWorldExtraByteSerialized)
    ) // Schnorr signature with incorrect length

    // Assert
    await expect(result).rejects.toThrow('Invalid Schnorr signature provided.')
  })

  it('Reject signature signed using invalid SIGHASH', async () => {
    // Arrange
    const privateKey = 'L3VFeEujGtevx9w18HD1fhRbCH67Az2dpCymeRE1SoPK6XQtaN2k' // Private key of bc1ppv609nr0vr25u07u95waq5lucwfm6tde4nydujnu8npg4q75mr5sxq8lt3
    const address = 'bc1ppv609nr0vr25u07u95waq5lucwfm6tde4nydujnu8npg4q75mr5sxq8lt3'
    const messageHelloWorld = 'Hello World'
    // Initialize private key used to sign the transaction
    const testPrivateKey = ECPair.fromWIF(privateKey)
    // Extract the taproot internal public key
    const internalPublicKey = testPrivateKey.publicKey.subarray(1, 33)
    // Tweak the private key for signing, since the output and address uses tweaked key
    // Reference: https://github.com/bitcoinjs/bitcoinjs-lib/blob/1a9119b53bcea4b83a6aa8b948f0e6370209b1b4/test/integration/taproot.spec.ts#L55
    const testPrivateKeyTweaked = testPrivateKey.tweak(
      bitcoin.crypto.taggedHash('TapTweak', testPrivateKey.publicKey.subarray(1, 33))
    )
    // Obtain the script public key
    const scriptPubKey: Buffer = bitcoin.payments.p2tr({
      address,
    }).output!
    // Draft a toSpend transaction with messageHelloWorld
    const toSpendTx = BIP322.buildToSpendTx(messageHelloWorld, scriptPubKey)
    // Draft, sign the toSign transaction, and extract the signature using different SIGHASH
    const signatureAnyOneCanPay = BIP322.encodeWitness(
      BIP322.buildToSignTx(toSpendTx.getId(), scriptPubKey, false, internalPublicKey)
        .updateInput(0, { sighashType: bitcoin.Transaction.SIGHASH_ANYONECANPAY })
        .signAllInputs(testPrivateKeyTweaked, [bitcoin.Transaction.SIGHASH_ANYONECANPAY])
        .finalizeAllInputs()
    )
    const signatureInputMask = BIP322.encodeWitness(
      BIP322.buildToSignTx(toSpendTx.getId(), scriptPubKey, false, internalPublicKey)
        .updateInput(0, { sighashType: bitcoin.Transaction.SIGHASH_INPUT_MASK })
        .signAllInputs(testPrivateKeyTweaked, [bitcoin.Transaction.SIGHASH_INPUT_MASK])
        .finalizeAllInputs()
    )
    const signatureNone = BIP322.encodeWitness(
      BIP322.buildToSignTx(toSpendTx.getId(), scriptPubKey, false, internalPublicKey)
        .updateInput(0, { sighashType: bitcoin.Transaction.SIGHASH_NONE })
        .signAllInputs(testPrivateKeyTweaked, [bitcoin.Transaction.SIGHASH_NONE])
        .finalizeAllInputs()
    )
    const signatureOutputMask = BIP322.encodeWitness(
      BIP322.buildToSignTx(toSpendTx.getId(), scriptPubKey, false, internalPublicKey)
        .updateInput(0, { sighashType: bitcoin.Transaction.SIGHASH_OUTPUT_MASK })
        .signAllInputs(testPrivateKeyTweaked, [bitcoin.Transaction.SIGHASH_OUTPUT_MASK])
        .finalizeAllInputs()
    )
    const signatureSingle = BIP322.encodeWitness(
      BIP322.buildToSignTx(toSpendTx.getId(), scriptPubKey, false, internalPublicKey)
        .updateInput(0, { sighashType: bitcoin.Transaction.SIGHASH_SINGLE })
        .signAllInputs(testPrivateKeyTweaked, [bitcoin.Transaction.SIGHASH_SINGLE])
        .finalizeAllInputs()
    )

    // Act
    const resultAnyOneCanPay = Verifier.verifySignature(
      address,
      messageHelloWorld,
      toBuffer(signatureAnyOneCanPay)
    )
    const resultInputMask = Verifier.verifySignature(
      address,
      messageHelloWorld,
      toBuffer(signatureInputMask)
    )
    const resultNone = Verifier.verifySignature(address, messageHelloWorld, toBuffer(signatureNone))
    const resultOutputMask = Verifier.verifySignature(
      address,
      messageHelloWorld,
      toBuffer(signatureOutputMask)
    )
    const resultSingle = Verifier.verifySignature(
      address,
      messageHelloWorld,
      toBuffer(signatureSingle)
    )

    // Assert
    await expect(resultAnyOneCanPay).rejects.toThrow(
      'Invalid SIGHASH used in signature. Must be either SIGHASH_ALL or SIGHASH_DEFAULT.'
    )
    await expect(resultInputMask).rejects.toThrow(
      'Invalid SIGHASH used in signature. Must be either SIGHASH_ALL or SIGHASH_DEFAULT.'
    )
    await expect(resultNone).rejects.toThrow(
      'Invalid SIGHASH used in signature. Must be either SIGHASH_ALL or SIGHASH_DEFAULT.'
    )
    await expect(resultOutputMask).rejects.toThrow(
      'Invalid SIGHASH used in signature. Must be either SIGHASH_ALL or SIGHASH_DEFAULT.'
    )
    await expect(resultSingle).rejects.toThrow(
      'Invalid SIGHASH used in signature. Must be either SIGHASH_ALL or SIGHASH_DEFAULT.'
    )
  })
})
