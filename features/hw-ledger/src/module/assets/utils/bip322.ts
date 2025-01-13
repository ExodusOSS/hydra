import * as bitcoin from '@exodus/bitcoinjs'
import { BIP322, Address } from '@exodus/bip322-js'

export function buildBip322PSBT(message: string, address: string) {
  const scriptPubKey = Address.convertAdressToScriptPubkey(address)
  const toSpendTx = BIP322.buildToSpendTx(message, scriptPubKey)
  const toSpendTxId = toSpendTx.getId()

  if (Address.isP2SH(address)) {
    // TODO: add support for signing nested segwit BIP-322 if we ever need it
    throw new Error('Unable to sign BIP-322 message for unimplemented address type.')
  } else if (Address.isP2WPKH(address) || Address.isP2TR(address)) {
    return buildToSignNativeSegwitOrTaproot(toSpendTxId, scriptPubKey)
  }

  throw new Error('Unable to sign BIP-322 message for unsupported address type.')
}

function buildToSignNativeSegwitOrTaproot(toSpendTxId: string, scriptPubKey: Buffer) {
  return new bitcoin.Psbt()
    .setVersion(0)
    .setLocktime(0)
    .addInput({
      hash: toSpendTxId,
      index: 0,
      sequence: 0,
      witnessUtxo: { value: 0, script: scriptPubKey },
    })
    .addOutput({
      value: 0,
      script: Buffer.from([bitcoin.opcodes.OP_RETURN!]),
    })
}
