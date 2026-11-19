// `Buffer.from`, `Buffer.allocUnsafe` and `Buffer.concat` serve sizes below
// `Buffer.poolSize >>> 1` from a shared ArrayBuffer that unrelated buffers keep
// alive and can read through `.buffer`. `Buffer.alloc` always allocates its own.

export const copySecret = (source: Uint8Array): Buffer => {
  const target = Buffer.alloc(source.length)
  target.set(source)
  return target
}

export const concatSecret = (...parts: Uint8Array[]): Buffer => {
  const target = Buffer.alloc(parts.reduce((length, part) => length + part.length, 0))
  let offset = 0
  for (const part of parts) {
    target.set(part, offset)
    offset += part.length
  }

  return target
}

export const wipe = (target: Uint8Array | null | undefined): void => {
  target?.fill(0)
}
