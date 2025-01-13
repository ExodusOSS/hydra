import {
  COMPONENT_PERCENT_ENCODE_SET,
  FRAGMENT_PERCENT_ENCODE_SET,
  PATH_PERCENT_ENCODE_SET,
  QUERY_PERCENT_ENCODE_SET,
  URL_ENCODED_PERCENT_ENCODE_SET,
  USERINFO_PERCENT_ENCODE_SET,
} from './constants'
import { TextEncoder, TextDecoder } from '@exodus/text-encoding-utf8'

import { codepoint, isASCIIHex } from './string'

const utf8Encoder = new TextEncoder()
const utf8Decoder = new TextDecoder('utf-8') // should be passed { ignoreBOM: true }

export function utf8Encode(input: string) {
  return utf8Encoder.encode(input)
}

export function utf8DecodeWithoutBOM(bytes: Uint8Array): string {
  return utf8Decoder.decode(bytes)
}

export function percentEncode(code: number) {
  let hex = code.toString(16).toUpperCase()
  if (hex.length === 1) {
    hex = `0${hex}`
  }

  return `%${hex}`
}

// https://url.spec.whatwg.org/#percent-decode
export function percentDecodeBytes(input: Uint8Array) {
  const output = new Uint8Array(input.byteLength)
  let outputIndex = 0
  for (let i = 0; i < input.byteLength; ++i) {
    const byte = input[i]
    if (byte !== 0x25) {
      output[outputIndex++] = byte
      continue
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (byte === 0x25 && (!isASCIIHex(input[i + 1]) || !isASCIIHex(input[i + 2]))) {
      output[outputIndex++] = byte
      continue
    }

    output[outputIndex++] = Number.parseInt(String.fromCodePoint(input[i + 1], input[i + 2]), 16)
    i += 2
  }

  return output.slice(0, outputIndex)
}

// https://url.spec.whatwg.org/#string-percent-decode
export function percentDecodeString(input: string) {
  const bytes = utf8Encode(input)
  return percentDecodeBytes(bytes)
}

// https://url.spec.whatwg.org/#c0-control-percent-encode-set
export function isC0ControlPercentEncode(code: number) {
  return code <= 0x1f || code > 0x7e
}

// https://url.spec.whatwg.org/#fragment-percent-encode-set
const extraFragmentPercentEncodeSet = new Set(FRAGMENT_PERCENT_ENCODE_SET.map(codepoint))
export function isFragmentPercentEncode(code: number) {
  return isC0ControlPercentEncode(code) || extraFragmentPercentEncodeSet.has(code)
}

// https://url.spec.whatwg.org/#query-percent-encode-set
const extraQueryPercentEncodeSet = new Set(QUERY_PERCENT_ENCODE_SET.map(codepoint))
export function isQueryPercentEncode(code: number) {
  return isC0ControlPercentEncode(code) || extraQueryPercentEncodeSet.has(code)
}

// https://url.spec.whatwg.org/#special-query-percent-encode-set
export function isSpecialQueryPercentEncode(code: number) {
  return isQueryPercentEncode(code) || code === codepoint("'")
}

// https://url.spec.whatwg.org/#path-percent-encode-set
const extraPathPercentEncodeSet = new Set(PATH_PERCENT_ENCODE_SET.map(codepoint))
export function isPathPercentEncode(code: number) {
  return isQueryPercentEncode(code) || extraPathPercentEncodeSet.has(code)
}

// https://url.spec.whatwg.org/#userinfo-percent-encode-set
const extraUserinfoPercentEncodeSet = new Set(USERINFO_PERCENT_ENCODE_SET.map(codepoint))

export function isUserinfoPercentEncode(code: number) {
  return isPathPercentEncode(code) || extraUserinfoPercentEncodeSet.has(code)
}

// https://url.spec.whatwg.org/#component-percent-encode-set
const extraComponentPercentEncodeSet = new Set(COMPONENT_PERCENT_ENCODE_SET.map(codepoint))
export function isComponentPercentEncode(code: number) {
  return isUserinfoPercentEncode(code) || extraComponentPercentEncodeSet.has(code)
}

// https://url.spec.whatwg.org/#application-x-www-form-urlencoded-percent-encode-set
const extraURLEncodedPercentEncodeSet = new Set(URL_ENCODED_PERCENT_ENCODE_SET.map(codepoint))
export function isURLEncodedPercentEncode(code: number) {
  return isComponentPercentEncode(code) || extraURLEncodedPercentEncodeSet.has(code)
}

// https://url.spec.whatwg.org/#code-point-percent-encode-after-encoding
// https://url.spec.whatwg.org/#utf-8-percent-encode
// Assuming encoding is always utf-8 allows us to trim one of the logic branches. TODO: support encoding.
// The "-Internal" variant here has code points as JS strings. The external version used by other files has code points
// as JS numbers, like the rest of the codebase.
function utf8PercentEncodeCodePointInternal(char: string, predicate: (byte: number) => boolean) {
  const bytes = utf8Encode(char)
  let output = ''
  for (const byte of bytes) {
    // Our percentEncodePredicate operates on bytes, not code points, so this is slightly different from the spec.
    if (!predicate(byte)) {
      output += String.fromCodePoint(byte)
      continue
    }

    output += percentEncode(byte)
  }

  return output
}

export function utf8PercentEncodeCodepoint(
  code: number | undefined,
  predicate: (byte: number) => boolean
) {
  if (code === undefined) return code
  return utf8PercentEncodeCodePointInternal(String.fromCodePoint(code), predicate)
}

// https://url.spec.whatwg.org/#string-percent-encode-after-encoding
// https://url.spec.whatwg.org/#string-utf-8-percent-encode
export function utf8PercentEncodeString(
  input: string,
  predicate: (byte: number) => boolean,
  spaceAsPlus = false
) {
  let encoded = ''
  for (const char of input) {
    if (spaceAsPlus && char === ' ') {
      encoded += '+'
      continue
    }

    encoded += utf8PercentEncodeCodePointInternal(char, predicate)
  }

  return encoded
}

function parseUrlencoded(input: Uint8Array): [string, string][] {
  const sequences = strictlySplitByteSequence(input, codepoint('&')!!) // eslint-disable-line @typescript-eslint/no-non-null-assertion
  const output: [string, string][] = []
  for (const bytes of sequences) {
    if (bytes.length === 0) {
      continue
    }

    let name, value
    const indexOfEqual = bytes.indexOf(codepoint('=')!!) // eslint-disable-line @typescript-eslint/no-non-null-assertion

    if (indexOfEqual >= 0) {
      name = bytes.slice(0, indexOfEqual)
      value = bytes.slice(indexOfEqual + 1)
    } else {
      name = bytes
      value = new Uint8Array(0)
    }

    name = replaceByteInByteSequence(name, 0x2b, 0x20)
    value = replaceByteInByteSequence(value, 0x2b, 0x20)

    const nameString = utf8DecodeWithoutBOM(percentDecodeBytes(name))
    const valueString = utf8DecodeWithoutBOM(percentDecodeBytes(value))

    output.push([nameString, valueString])
  }
  return output
}

// https://url.spec.whatwg.org/#concept-urlencoded-string-parser
export function parseUrlencodedString(input: string) {
  return parseUrlencoded(utf8Encode(input))
}

// https://url.spec.whatwg.org/#concept-urlencoded-serializer
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function serializeUrlencoded(tuples: any, encodingOverride?: string) {
  let encoding = 'utf-8'
  if (encodingOverride !== undefined) {
    // TODO "get the output encoding", i.e. handle encoding labels vs. names.
    encoding = encodingOverride
  }

  let output = ''
  for (const [i, tuple] of tuples.entries()) {
    // TODO: handle encoding override

    const name = utf8PercentEncodeString(tuple[0], isURLEncodedPercentEncode, true)

    let value = tuple[1]
    if (tuple.length > 2 && tuple[2] !== undefined) {
      if (tuple[2] === 'hidden' && name === '_charset_') {
        value = encoding
      } else if (tuple[2] === 'file') {
        // value is a File object
        value = value.name
      }
    }

    value = utf8PercentEncodeString(value, isURLEncodedPercentEncode, true)

    if (i !== 0) {
      output += '&'
    }
    output += `${name}=${value}`
  }
  return output
}

export function strictlySplitByteSequence(buffer: Uint8Array, code: number) {
  const list = []
  let last = 0
  let i = buffer.indexOf(code)
  while (i >= 0) {
    list.push(buffer.slice(last, i))
    last = i + 1
    i = buffer.indexOf(code, last)
  }
  if (last !== buffer.length) {
    list.push(buffer.slice(last))
  }
  return list
}

export function replaceByteInByteSequence(buf: Uint8Array, from: number, to: number) {
  let i = buf.indexOf(from)
  while (i >= 0) {
    buf[i] = to // eslint-disable-line @exodus/mutable/no-param-reassign-prop-only
    i = buf.indexOf(from, i + 1)
  }
  return buf
}
