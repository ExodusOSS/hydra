/* eslint-disable no-control-regex */
import {
  isC0ControlPercentEncode,
  percentDecodeString,
  utf8DecodeWithoutBOM,
  utf8PercentEncodeString,
} from './encoding'
import { at, codepoint, isASCIIDigit, isASCIIHex } from './string'
import { FAILURE, SPECIAL_SCHEMES } from './constants'

export function parseIPv4Number(input: string) {
  if (input === '') {
    return FAILURE
  }

  let R = 10

  if (input.length >= 2 && input.charAt(0) === '0' && input.charAt(1).toLowerCase() === 'x') {
    input = input.slice(2)
    R = 16
  } else if (input.length >= 2 && input.charAt(0) === '0') {
    input = input.slice(1)
    R = 8
  }

  if (input === '') {
    return 0
  }

  let regex = /[^0-7]/u
  if (R === 10) {
    regex = /[^0-9]/u
  }
  if (R === 16) {
    regex = /[^0-9A-Fa-f]/u
  }

  if (regex.test(input)) {
    return FAILURE
  }

  return Number.parseInt(input, R)
}

export function parseIPv4(input: string) {
  const parts = input.split('.')
  if (parts[parts.length - 1] === '' && parts.length > 1) {
    parts.pop()
  }

  if (parts.length > 4) {
    return FAILURE
  }

  const numbers = []
  for (const part of parts) {
    const n = parseIPv4Number(part)
    if (n === FAILURE) {
      return FAILURE
    }

    numbers.push(n)
  }

  for (let i = 0; i < numbers.length - 1; ++i) {
    if (numbers[i] > 255) {
      return FAILURE
    }
  }
  if (numbers[numbers.length - 1] >= 256 ** (5 - numbers.length)) {
    return FAILURE
  }

  let ipv4 = numbers.pop() ?? 0
  let counter = 0

  for (const n of numbers) {
    ipv4 += n * 256 ** (3 - counter)
    ++counter
  }

  return ipv4
}

export function serializeIPv4(address: number) {
  let output = ''
  let n = address

  for (let i = 1; i <= 4; ++i) {
    output = String(n % 256) + output
    if (i !== 4) {
      output = `.${output}`
    }
    n = Math.floor(n / 256)
  }

  return output
}

export function parseIPv6(input: string) {
  const address = [0, 0, 0, 0, 0, 0, 0, 0]
  let pieceIndex = 0
  let compress = null
  let cursor = 0

  const codepoints = [...input].map((c) => c.codePointAt(0))

  if (codepoints[cursor] === codepoint(':')) {
    if (codepoints[cursor + 1] !== codepoint(':')) {
      return FAILURE
    }

    cursor += 2
    ++pieceIndex
    compress = pieceIndex
  }

  while (cursor < codepoints.length) {
    if (pieceIndex === 8) {
      return FAILURE
    }

    if (codepoints[cursor] === codepoint(':')) {
      if (compress !== null) {
        return FAILURE
      }
      ++cursor
      ++pieceIndex
      compress = pieceIndex
      continue
    }

    let value = 0
    let length = 0

    while (length < 4 && isASCIIHex(codepoints[cursor])) {
      value = value * 0x10 + Number.parseInt(at(codepoints, cursor)!!, 16) // eslint-disable-line @typescript-eslint/no-non-null-assertion
      ++cursor
      ++length
    }

    if (codepoints[cursor] === codepoint('.')) {
      if (length === 0) {
        return FAILURE
      }

      cursor -= length

      if (pieceIndex > 6) {
        return FAILURE
      }

      let numbersSeen = 0

      while (codepoints[cursor] !== undefined) {
        let ipv4Piece = null

        if (numbersSeen > 0) {
          if (codepoints[cursor] === codepoint('.') && numbersSeen < 4) {
            ++cursor
          } else {
            return FAILURE
          }
        }

        if (!isASCIIDigit(codepoints[cursor])) {
          return FAILURE
        }

        while (isASCIIDigit(codepoints[cursor])) {
          const number = Number(at(codepoints, cursor))
          if (ipv4Piece === null) {
            ipv4Piece = number
          } else if (ipv4Piece === 0) {
            return FAILURE
          } else {
            ipv4Piece = ipv4Piece * 10 + number
          }
          if (ipv4Piece > 255) {
            return FAILURE
          }
          ++cursor
        }

        address[pieceIndex] = address[pieceIndex] * 0x1_00 + ipv4Piece!! // eslint-disable-line @typescript-eslint/no-non-null-assertion

        ++numbersSeen

        if (numbersSeen === 2 || numbersSeen === 4) {
          ++pieceIndex
        }
      }

      if (numbersSeen !== 4) {
        return FAILURE
      }

      break
    } else if (codepoints[cursor] === codepoint(':')) {
      ++cursor
      if (codepoints[cursor] === undefined) {
        return FAILURE
      }
    } else if (codepoints[cursor] !== undefined) {
      return FAILURE
    }

    address[pieceIndex] = value
    ++pieceIndex
  }

  if (compress !== null) {
    let swaps = pieceIndex - compress
    pieceIndex = 7
    while (pieceIndex !== 0 && swaps > 0) {
      const temp = address[compress + swaps - 1]
      address[compress + swaps - 1] = address[pieceIndex]
      address[pieceIndex] = temp
      --pieceIndex
      --swaps
    }
  } else if (pieceIndex !== 8) {
    return FAILURE
  }

  return address
}

export function findLongestZeroSequence(arr: number[]) {
  let maxIdx = null
  let maxLen = 1 // only find elements > 1
  let currStart = null
  let currLen = 0

  for (const [i, element] of arr.entries()) {
    if (element === 0) {
      if (currStart === null) {
        currStart = i
      }
      ++currLen
    } else {
      if (currLen > maxLen) {
        maxIdx = currStart
        maxLen = currLen
      }

      currStart = null
      currLen = 0
    }
  }

  // if trailing zeros
  if (currLen > maxLen) {
    return currStart
  }

  return maxIdx
}

export function serializeIPv6(address: number[]) {
  let output = ''
  const compress = findLongestZeroSequence(address)
  let ignore0 = false

  for (let pieceIndex = 0; pieceIndex <= 7; ++pieceIndex) {
    if (ignore0 && address[pieceIndex] === 0) {
      continue
    } else if (ignore0) {
      ignore0 = false
    }

    if (compress === pieceIndex) {
      const separator = pieceIndex === 0 ? '::' : ':'
      output += separator
      ignore0 = true
      continue
    }

    output += address[pieceIndex].toString(16)

    if (pieceIndex !== 7) {
      output += ':'
    }
  }

  return output
}

export function containsForbiddenHostCodePoint(value: string): boolean {
  return value.search(/\u0000|\u0009|\u000A|\u000D|\u0020|#|%|\/|:|<|>|\?|@|\[|\\|\]|\^|\|/u) !== -1
}

function containsForbiddenDomainCodePoint(value: string): boolean {
  return containsForbiddenHostCodePoint(value) || value.search(/[\u0000-\u001F]|%|\u007F/u) !== -1
}

export function containsForbiddenHostCodePointExPercent(value: string) {
  return value.search(/\u0000|\u0009|\u000A|\u000D|\u0020|#|\/|:|<|>|\?|@|\[|\\|\]|\^|\|/u) !== -1
}

export function endsInNumber(input: string) {
  const parts = input.split('.')
  if (parts[parts.length - 1] === '') {
    if (parts.length === 1) {
      return false
    }
    parts.pop()
  }

  const last = parts[parts.length - 1]
  if (parseIPv4Number(last) !== FAILURE) {
    return true
  }

  return /^[0-9]+$/u.test(last)
}

export function parseHost(input: string, isNotSpecialArg = false) {
  if (input[0] === '[') {
    if (input[input.length - 1] !== ']') {
      return FAILURE
    }

    return parseIPv6(input.slice(1, -1))
  }

  if (isNotSpecialArg) {
    return parseOpaqueHost(input)
  }

  const domain = utf8DecodeWithoutBOM(percentDecodeString(input))
  const asciiDomain = domainToASCII(domain)
  if (asciiDomain === FAILURE) {
    return FAILURE
  }

  if (containsForbiddenDomainCodePoint(asciiDomain)) {
    return FAILURE
  }

  if (endsInNumber(asciiDomain)) {
    return parseIPv4(asciiDomain)
  }

  return asciiDomain
}

export function parseOpaqueHost(input: string) {
  if (containsForbiddenHostCodePointExPercent(input)) {
    return FAILURE
  }

  return utf8PercentEncodeString(input, isC0ControlPercentEncode)
}

export function serializeHost(host: number | string | number[]) {
  if (typeof host === 'number') {
    return serializeIPv4(host)
  }

  // IPv6 serializer
  if (Array.isArray(host)) {
    return `[${serializeIPv6(host)}]`
  }

  return host
}

export function domainToASCII(domain: string) {
  // Add tr46 as dependency and comment this in to support unicode domains
  // const result = tr46.toASCII(domain, {
  //   checkBidi: true,
  //   checkHyphens: false,
  //   checkJoiners: true,
  //   useSTD3ASCIIRules: false,
  //   verifyDNSLength: false,
  // })
  const result = domain

  if (!result) {
    return FAILURE
  }

  return result.toLowerCase()
}

export function defaultPort(scheme?: string): number | undefined {
  return SPECIAL_SCHEMES[scheme as never]
}
