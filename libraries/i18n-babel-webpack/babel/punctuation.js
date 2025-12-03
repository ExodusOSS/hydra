const LEADING_REGEX = /^(\.{3}|…|\s)*/u
const TRAILING_REGEX = /[.…]+$/u

const extractPunctuations = (string) => {
  const leadingMatch = string.match(LEADING_REGEX)
  const trailingMatch = string.match(TRAILING_REGEX)

  const leading = leadingMatch ? leadingMatch[0] : ''
  const trailing = trailingMatch ? trailingMatch[0] : ''

  const message = string.replace(LEADING_REGEX, '').replace(TRAILING_REGEX, '').trim()

  return { message, leading, trailing }
}

module.exports = extractPunctuations
