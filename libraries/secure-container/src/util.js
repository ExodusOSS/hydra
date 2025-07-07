import varstruct, { Buffer as Buf } from 'varstruct'

export function vsf(fields) {
  return fields.map((fields) => ({
    name: fields[0],
    type: Array.isArray(fields[1]) ? varstruct(vsf(fields[1])) : fields[1],
  }))
}

// zero-terminated C-string (Buffer)
export function CStr(length, encoding = 'utf8') {
  const bufferCodec = Buf(length)

  function encode(value, buffer, offset) {
    const buf = Buffer.alloc(length)
    buf.write(value, encoding)
    return bufferCodec.encode(buf, buffer, offset)
  }

  function decode(buffer, offset, end) {
    const buf = bufferCodec.decode(buffer, offset, end)
    let i = 0
    for (; i < buf.length; i++) if (buf[i] === 0) break
    return buf.slice(0, i).toString(encoding)
  }

  const encodingLength = () => length

  // TODO: submit pr on varstruct if 'bytes' is undefined
  encode.bytes = decode.bytes = length

  return { encode, decode, encodingLength }
}
