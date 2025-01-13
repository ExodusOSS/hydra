const web3 = require('@solana/web3.js')

const buildTransferTransactionMessage = () => {
  const transaction = new web3.Transaction().add(
    web3.SystemProgram.transfer({
      fromPubkey: new web3.PublicKey('A5qAhuHsx3FveB2CspArSuZ4gVHKDbZHmg38aCHYF1Ju'),
      toPubkey: new web3.PublicKey('A5qAhuHsx3FveB2CspArSuZ4gVHKDbZHmg38aCHYF1Ju'),
      lamports: web3.LAMPORTS_PER_SOL / 100,
    })
  )
  transaction.recentBlockhash = 'CktRuQ2mttgRGkXJtyksdKHjUdc2C4TgDzyB98oEzy8'
  transaction.feePayer = new web3.PublicKey('A5qAhuHsx3FveB2CspArSuZ4gVHKDbZHmg38aCHYF1Ju')

  const message = transaction.compileMessage()
  return message.serialize()
}

const buildOffchainMessageV0 = () => {
  return Buffer.concat([
    /* Signing Domain Specifier: 0xffsolana offchain */
    Buffer.from('ff', 'hex'),
    Buffer.from('solana offchain', 'ascii'),
    /* Header: 0x00 */
    Buffer.from('00', 'hex'),
    /* Application Domain: 32 bytes */
    // Buffer.from('00'.repeat(32), 'hex'),
    /* Message Format; 0x00 or 0x01 or 0x02 */
    Buffer.from('00', 'hex'),
    /* Signer counts */
    // Buffer.from('01', 'hex'),
    /* Signer public keys */
    // Buffer.from(
    //   '86f5f7f2c7e98ba2d5ed1e68d585d976e3fc020cbab2b3e04cdd5fe85369576e',
    //   'hex'
    // ),
    /* Message length: 11 in uint16 */
    Buffer.from('0b00', 'hex'),
    Buffer.from('hello world', 'ascii'),
  ])
}

const buildOffchainMessageV1 = () => {
  return Buffer.concat([
    /* Signing Domain Specifier: 0xffsolana offchain */
    Buffer.from('ff', 'hex'),
    Buffer.from('solana offchain', 'ascii'),
    /* Header: 0x00 */
    Buffer.from('00', 'hex'),
    /* Application Domain: 32 bytes */
    // Buffer.from('00'.repeat(32), 'hex'),
    /* Message Format; 0x00 or 0x01 or 0x02 */
    Buffer.from('01', 'hex'),
    /* Signer counts */
    // Buffer.from('01', 'hex'),
    /* Signer public keys */
    // Buffer.from(
    //   '86f5f7f2c7e98ba2d5ed1e68d585d976e3fc020cbab2b3e04cdd5fe85369576e',
    //   'hex'
    // ),
    /* Message length: 11 in uint16 */
    Buffer.from('0b00', 'hex'),
    Buffer.from('hello world', 'ascii'),
  ])
}

console.log('transfer message')
console.log('-------------------------------')
console.log(buildTransferTransactionMessage().toString('hex'))
console.log('-------------------------------')
console.log('offchain message version 0')
console.log(buildOffchainMessageV0().toString('hex'))
console.log('-------------------------------')
console.log('offchain message version 1')
console.log(buildOffchainMessageV1().toString('hex'))
