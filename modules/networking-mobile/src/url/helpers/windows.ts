import { codepoint, isASCIIAlpha } from './string'

const fileOtherwiseCodePoints = new Set([
  codepoint('/'),
  codepoint('\\'),
  codepoint('?'),
  codepoint('#'),
])

export function isWindowsDriveLetterCodePoints(cp1: number, cp2: number) {
  return isASCIIAlpha(cp1) && (cp2 === codepoint(':') || cp2 === codepoint('|'))
}

export function isWindowsDriveLetterString(string: string) {
  return (
    string.length === 2 &&
    isASCIIAlpha(string.codePointAt(0)) &&
    (string[1] === ':' || string[1] === '|')
  )
}

export function isNormalizedWindowsDriveLetterString(value: string) {
  return value.length === 2 && isASCIIAlpha(value.codePointAt(0)) && value[1] === ':'
}

export function startsWithWindowsDriveLetter(codepoints: number[], cursor: number) {
  const length = codepoints.length - cursor
  return (
    length >= 2 &&
    isWindowsDriveLetterCodePoints(codepoints[cursor], codepoints[cursor + 1]) &&
    (length === 2 || fileOtherwiseCodePoints.has(codepoints[cursor + 2]))
  )
}

export function isNormalizedWindowsDriveLetter(input: string) {
  return /^[A-Za-z]:$/u.test(input)
}
