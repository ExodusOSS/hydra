export function fromUInt32BE(num) {
  const buf = Buffer.alloc(4)
  buf.writeUInt32BE(num)
  return buf
}
