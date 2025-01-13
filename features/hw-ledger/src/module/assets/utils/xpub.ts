import bs58check from 'bs58check'

export function buildFauxXPUB(publicKey: Buffer, chainCode: Buffer) {
  // => version(4) || depth(1) || fingerprint(4) || index(4) || chain(32) || key(33)
  const LEN = 78
  const XPUB_PREFIX = 0x04_88_b2_1e
  const buffer = Buffer.alloc(LEN)

  // Faux because we cheat these:
  const fingerprint = 0x00_00_00_00
  const depth = 0
  const index = 0
  // End of cheating
  buffer.writeUInt32BE(XPUB_PREFIX, 0)
  buffer.writeUInt8(depth, 4)
  buffer.writeUInt32BE(fingerprint, 5)
  buffer.writeUInt32BE(index, 9)

  chainCode.copy(buffer, 13)
  publicKey.copy(buffer, 45)

  return bs58check.encode(buffer)
}
