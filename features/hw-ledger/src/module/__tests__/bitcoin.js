import { tiny_secp256k1_compat as ecc } from '@exodus/crypto/secp256k1'
import { PsbtV2 } from '@exodus/ledger-bitcoin'
import { initEccLib, payments, Psbt } from 'bitcoinjs-lib'
import { ECPairFactory } from 'ecpair'

const ECPair = ECPairFactory(ecc)
initEccLib(ecc)

const MASTER_FINGERPRINT = '75cc42dc'
const PATH_SEGWIT_NORMAL_0 = "m/84'/0'/0'/0/0"
const PATH_SEGWIT_NORMAL_1 = "m/84'/0'/0'/0/1"
const PATH_SEGWIT_CHANGE_0 = "m/84'/0'/0'/1/0"
const PATH_TAPROOT_NORMAL_0 = "m/86'/0'/0'/0/0"
const PATH_TAPROOT_NORMAL_1 = "m/86'/0'/0'/0/1"
const PATH_TAPROOT_CHANGE_0 = "m/86'/0'/0'/1/0"

// Only add at the end, order in this object determines
// output indices, so just add at the end pls.
const ADDRESSES = {
  [PATH_SEGWIT_NORMAL_0]: 'bc1qwfm5x9dl8hqpff93getkrsmqd9l2mdhhfglnrs',
  [PATH_SEGWIT_NORMAL_1]: 'bc1qlpx34gxmwp9aukdqj0va2zpv2mj5d6cnm62fsl',
  [PATH_TAPROOT_NORMAL_0]: 'bc1plfa6egr94lcda0pmcwn3gh253d5fecd92w7pp6spwrt9xgy4aypqhs29nj',
  [PATH_TAPROOT_NORMAL_1]: 'bc1p4f7rvggnhn8wwdfaxp5k9n4xhn7hg2umyxqemc8sfx4x8jyrrmgq7zkg3q',
}

const CHANGE_ADDRESSES = {
  [PATH_SEGWIT_CHANGE_0]: 'bc1qg77anwvlah3zcc6j6ed8pncsslflu7ctdnznnl',
  [PATH_TAPROOT_CHANGE_0]: 'bc1p9v787288lmqlql5uxnrczeshz43lsy4pwtmaaxsxvf8al485nmus33pwy9',
}

const PUBLIC_KEYS = {
  [PATH_SEGWIT_NORMAL_0]: '02dfb58125642407d02a4821197ed2ca7a7f8cd9427ac30d2dbce509c837d6dba2',
  [PATH_SEGWIT_NORMAL_1]: '032c6638ae002a21da34ca94904ef8daa90eeb58e04ff8c3242b1b5846ccc0d812',
  [PATH_SEGWIT_CHANGE_0]: '035bc73838f45d0fc4d6e14fade075b192fb73ff7fb0a5815e3b6d6fde66940823',
  [PATH_TAPROOT_NORMAL_0]: '6c85aae5f51cc0aeaf3994a98f796724c5b912dfe81fc10d3133a1612f6a4eee',
  [PATH_TAPROOT_NORMAL_1]: '6a404be33e2843947ff41187340dbdf56ad83431c2a9a78004ca3f8fdfe92a93',
  [PATH_TAPROOT_CHANGE_0]: '66489da524ef8a290fc530db69e5fdc7304962c81e690cb4d90fc6c5d71a9143',
}

const UTXO_AMOUNT = 50_000_000

/**
 * Creates a transactions that creates fake UTXO's to use for
 * signing with Ledger device. Each address in ADDRESSES above will receive
 * the 1 utxo of the amount UTXO_AMOUNT.
 * @returns {Buffer} raw signed transaction (not psbt!)
 */
function createNonWitnessUtxoTransaction() {
  const psbt = new Psbt({ eccLib: ecc })

  psbt.addInput({
    hash: '75ddabb27b8845f5247975c8a5ba7c6f336c4570708ebe230caf6db5217ae858',
    index: 0,
    witnessUtxo: {
      script: payments.p2wpkh({
        pubkey: Buffer.from(
          '02dfb58125642407d02a4821197ed2ca7a7f8cd9427ac30d2dbce509c837d6dba2',
          'hex'
        ),
      }).output,
      value: UTXO_AMOUNT * Object.keys(ADDRESSES).length,
    },
  })

  for (const address of Object.values(ADDRESSES)) {
    psbt.addOutput({
      address,
      value: UTXO_AMOUNT,
    })
  }

  psbt.signInput(0, ECPair.fromWIF('Kxjokbtb9hFYZ6HK4CrBHoSSHeQLXXuiwf4sHhQSQX7qWBzKmoLF'))
  psbt.finalizeAllInputs()
  return psbt.extractTransaction()
}

function createSegwitV0SpendingPSBT() {
  const nonWitnessUtxoTransaction = createNonWitnessUtxoTransaction()

  const psbt = new Psbt({ eccLib: ecc })
  psbt.addInput({
    hash: nonWitnessUtxoTransaction.getId(),
    index: 0,
    bip32Derivation: [
      {
        masterFingerprint: Buffer.from(MASTER_FINGERPRINT, 'hex'),
        pubkey: Buffer.from(PUBLIC_KEYS[PATH_SEGWIT_NORMAL_0], 'hex'),
        path: PATH_SEGWIT_NORMAL_0,
      },
    ],
    witnessUtxo: {
      script: payments.p2wpkh({
        address: ADDRESSES[PATH_SEGWIT_NORMAL_0],
        // pubkey: Buffer.from(PUBLIC_KEYS[PATH_SEGWIT_NORMAL_0], 'hex'),
      }).output,
      value: UTXO_AMOUNT,
    },
    nonWitnessUtxo: nonWitnessUtxoTransaction.toBuffer(),
  })

  psbt.addInput({
    hash: nonWitnessUtxoTransaction.getId(),
    index: 1,
    bip32Derivation: [
      {
        masterFingerprint: Buffer.from(MASTER_FINGERPRINT, 'hex'),
        pubkey: Buffer.from(PUBLIC_KEYS[PATH_SEGWIT_NORMAL_1], 'hex'),
        path: PATH_SEGWIT_NORMAL_1,
      },
    ],
    witnessUtxo: {
      script: payments.p2wpkh({
        address: ADDRESSES[PATH_SEGWIT_NORMAL_1],
        // pubkey: Buffer.from(PUBLIC_KEYS[PATH_SEGWIT_NORMAL_1], 'hex'),
      }).output,
      value: UTXO_AMOUNT,
    },
    nonWitnessUtxo: nonWitnessUtxoTransaction.toBuffer(),
  })

  psbt.addOutput({
    address: '1PmnHdtMivFTULDuqfbkTpZR98AZSFvCYZ',
    value: 49_990_000,
  })

  // Change output
  psbt.addOutput({
    address: CHANGE_ADDRESSES[PATH_SEGWIT_CHANGE_0],
    value: 49_990_000,
    bip32Derivation: [
      {
        masterFingerprint: Buffer.from(MASTER_FINGERPRINT, 'hex'),
        pubkey: Buffer.from(PUBLIC_KEYS[PATH_SEGWIT_CHANGE_0], 'hex'),
        path: PATH_SEGWIT_CHANGE_0,
      },
    ],
  })

  const x = new PsbtV2()
  x.deserialize(psbt.toBuffer())
  return x
}

function createTaprootSpendingPSBT() {
  const nonWitnessUtxoTransaction = createNonWitnessUtxoTransaction()

  const psbt = new Psbt({ eccLib: ecc })
  psbt.addInput({
    hash: nonWitnessUtxoTransaction.getId(),
    index: 3,
    tapInternalKey: Buffer.from(PUBLIC_KEYS[PATH_TAPROOT_NORMAL_0], 'hex'),
    tapBip32Derivation: [
      {
        masterFingerprint: Buffer.from(MASTER_FINGERPRINT, 'hex'),
        pubkey: Buffer.from(PUBLIC_KEYS[PATH_TAPROOT_NORMAL_0], 'hex'),
        path: PATH_TAPROOT_NORMAL_0,
        leafHashes: [],
      },
    ],
    witnessUtxo: {
      script: payments.p2tr(
        {
          address: ADDRESSES[PATH_TAPROOT_NORMAL_0],
        },
        { eccLib: ecc }
      ).output,
      value: UTXO_AMOUNT,
    },
  })

  psbt.addInput({
    hash: nonWitnessUtxoTransaction.getId(),
    index: 4,
    tapInternalKey: Buffer.from(PUBLIC_KEYS[PATH_TAPROOT_NORMAL_1], 'hex'),
    tapBip32Derivation: [
      {
        masterFingerprint: Buffer.from(MASTER_FINGERPRINT, 'hex'),
        pubkey: Buffer.from(PUBLIC_KEYS[PATH_TAPROOT_NORMAL_1], 'hex'),
        path: PATH_TAPROOT_NORMAL_1,
        leafHashes: [],
      },
    ],
    witnessUtxo: {
      script: payments.p2tr(
        {
          address: ADDRESSES[PATH_TAPROOT_NORMAL_1],
        },
        { eccLib: ecc }
      ).output,
      value: UTXO_AMOUNT,
    },
  })

  psbt.addOutput({
    address: '1PmnHdtMivFTULDuqfbkTpZR98AZSFvCYZ',
    value: 49_990_000,
  })

  // Change output
  psbt.addOutput({
    address: CHANGE_ADDRESSES[PATH_TAPROOT_CHANGE_0],
    value: 49_990_000,
    tapBip32Derivation: [
      {
        masterFingerprint: Buffer.from(MASTER_FINGERPRINT, 'hex'),
        pubkey: Buffer.from(PUBLIC_KEYS[PATH_TAPROOT_CHANGE_0], 'hex'),
        path: PATH_TAPROOT_CHANGE_0,
        leafHashes: [],
      },
    ],
  })

  const x = new PsbtV2()
  x.deserialize(psbt.toBuffer())
  return x
}

console.log('segwit')
console.log('-------------------------------')
console.log(createSegwitV0SpendingPSBT().serialize().toString('hex'))
console.log('-------------------------------')
console.log('taproot')
console.log('-------------------------------')
console.log(createTaprootSpendingPSBT().serialize().toString('hex'))
console.log('-------------------------------')

// console.log(
//   payments.p2tr({
//     internalPubkey: Buffer.from(PUBLIC_KEYS[PATH_TAPROOT_NORMAL_0], 'hex'),
//   }).address
// )
