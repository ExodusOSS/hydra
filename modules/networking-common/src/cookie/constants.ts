/*
 * CTL - control character
 * (octets 0 - 31) and DEL (127)>
 */
const CONTROL_CHARACTERS: ReadonlyArray<string> = [...Array.from({ length: 32 }).keys(), 127].map(
  (it) => String.fromCodePoint(it)
)

const SEPARATORS: ReadonlyArray<string> = [
  '(',
  ')',
  '<',
  '>',
  '@',
  ',',
  ';',
  ':',
  '\\',
  '"',
  '/',
  '[',
  ']',
  '?',
  '=',
  '{',
  '}',
  ' ',
  '\t',
]

/*
 * https://www.rfc-editor.org/rfc/rfc6265#section-4
 *
 * cookie-value
 *
 * US-ASCII characters excluding CTLs,
 * whitespace DQUOTE, comma, semicolon,
 * and backslash
 */
const FORBIDDEN_IN_VALUE = new Set([...CONTROL_CHARACTERS, ' ', '"', ',', ';', '\\'])

const CONTROL_CHARACTERS_AND_SEPARATORS = new Set([...CONTROL_CHARACTERS, ...SEPARATORS])

export { SEPARATORS, CONTROL_CHARACTERS, CONTROL_CHARACTERS_AND_SEPARATORS, FORBIDDEN_IN_VALUE }
