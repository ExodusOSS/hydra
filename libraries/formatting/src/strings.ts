export function toCamelCase(input: string): string {
  return toFirstLower(input.replace(/[^\dA-Za-z]+(.)/gu, (m, chr) => chr.toUpperCase()))
}

export function toFirstUpper(input: string): string {
  return input.replace(/^(.)/u, (m, chr) => chr.toUpperCase())
}

export function toFirstLower(input: string): string {
  return input.replace(/^(.)/u, (m, chr) => chr.toLowerCase())
}

export function toKebapCase(text: string): string {
  return text
    .replace(/([a-z])([A-Z])/gu, '$1-$2')
    .replace(/[\s_]+/gu, '-')
    .toLowerCase()
}

const SNAKE_CASE_REPLACE_REGEX = /[\s-]|([\da-z])([A-Z])/gu
export function toSnakeCase(text: string): string {
  return text
    .replace(SNAKE_CASE_REPLACE_REGEX, (match, g1, g2) => {
      if (g1 && g2) {
        return g1 + '_' + g2
      }

      return '_'
    })
    .toLowerCase()
}

export function toUpperSnakeCase(text: string): string {
  return toSnakeCase(text).toUpperCase()
}

export function toPascalCase(input: string): string {
  return toFirstUpper(toCamelCase(input))
}

type PadOptions = {
  character: string
  length: number
  direction?: 'start' | 'end'
}

export function pad(
  input: number | string,
  { character, length, direction = 'start' }: PadOptions
): string {
  const text = `${input}`
  if (text.length > length) return text

  const padding = character.repeat(length - text.length)
  return direction === 'start' ? `${padding}${text}` : `${text}${padding}`
}

type TruncateOptions = {
  etc?: string
  maxLen: number
}

/**
 * Truncates a text so that it is less than maxLen, keeps words intact
 */

export function truncate(text: string, { maxLen, etc = '...' }: TruncateOptions) {
  if (text.length < maxLen) {
    return text
  }

  const { indexes } = text
    .split(/[\s,.:]/u)
    .reduce<{ indexes: [number, string][]; cursor: number }>(
      ({ indexes, cursor }, word) => {
        const index = text.indexOf(word, cursor)
        indexes.push([index, word])
        return { indexes, cursor: index + word.length }
      },
      { indexes: [], cursor: 0 }
    )

  const lastValidIndex =
    indexes.findIndex(([index, word]) => index + word.length + etc.length >= maxLen) - 1

  if (lastValidIndex === -1) {
    return etc.slice(0, maxLen)
  }

  const [index, word] = indexes[lastValidIndex]!
  const splitAt = index + word.length

  return `${text.slice(0, splitAt)}${etc}`
}

export function truncateMiddle(text: string, { maxLen, etc = '...' }: TruncateOptions) {
  if (!text || text.length <= maxLen) return text

  const keep = maxLen - etc.length
  if (keep <= 0) return etc.slice(0, maxLen)

  const leftChars = Math.ceil(keep / 2)
  const rightChars = keep - leftChars

  return text.slice(0, leftChars) + etc + text.slice(-rightChars)
}

export const pluralize = (string: string, number: number) =>
  number ? (number > 1 ? `${number} ${string}s` : `${number} ${string}`) : ''
