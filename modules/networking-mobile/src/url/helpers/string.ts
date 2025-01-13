/* eslint-disable no-control-regex */

export function at(codepoints: (number | undefined)[], idx: number | undefined) {
  if (idx === undefined) return

  const c = codepoints[idx]
  return !c || isNaN(c) ? undefined : String.fromCodePoint(c)
}

export function isSingleDot(value: string) {
  return value === '.' || value.toLowerCase() === '%2e'
}

export function isDoubleDot(value: string) {
  value = value.toLowerCase()
  return value === '..' || value === '%2e.' || value === '.%2e' || value === '%2e%2e'
}

export function trimControlChars(url: string) {
  return url.replace(/^[\u0000-\u001F\u0020]+|[\u0000-\u001F\u0020]+$/gu, '')
}

export function trimTabAndNewline(url: string) {
  return url.replace(/\u0009|\u000A|\u000D/gu, '')
}

export function isASCIIDigit(c: number | undefined) {
  return c && c >= 0x30 && c <= 0x39
}

export function isASCIIAlpha(c: number | undefined) {
  return c && ((c >= 0x41 && c <= 0x5a) || (c >= 0x61 && c <= 0x7a))
}

export function isASCIIAlphanumeric(c: number) {
  return isASCIIAlpha(c) || isASCIIDigit(c)
}

export function isASCIIHex(c: number | undefined) {
  if (c === undefined) return false

  return isASCIIDigit(c) || (c >= 0x41 && c <= 0x46) || (c >= 0x61 && c <= 0x66)
}

export function countSymbols(str: string): number {
  return [...str].length
}

export function codepoint(char: string): number | undefined {
  return char.codePointAt(0)
}

export function codepoints(...chars: string[]): (number | undefined)[] {
  return chars.map(codepoint)
}
