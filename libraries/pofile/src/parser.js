const parser = (tokens) => {
  let current = 0

  const comments = []
  const flags = []
  const references = []
  const values = Object.create(null)
  const storageByModifier = {
    ' ': comments,
    ',': flags,
    ':': references,
  }

  while (current < tokens.length) {
    const token = tokens[current]

    switch (token.type) {
      case 'comment': {
        const storage = storageByModifier[token.modifier]
        if (!storage) {
          throw new TypeError(
            `pofile: unsupported comment marker ${JSON.stringify(`#${token.modifier}`)}`
          )
        }

        storage.push(token.value)
        current++
        break
      }

      case 'name': {
        const value = tokens[current + 1]
        if (value?.type !== 'string') {
          throw new TypeError(`pofile: expected a quoted string after "${token.value}"`)
        }

        // Only the header spreads a value over several quoted lines, and the
        // header is removed before parsing. Lokalise splits translations at
        // line breaks without a `\n` escape, so concatenating would drop them.
        if (tokens[current + 2]?.type === 'string') {
          throw new TypeError(`pofile: wrapped strings are not supported ("${token.value}")`)
        }

        values[token.value] = value.value
        current += 2
        break
      }

      default:
        throw new TypeError(`Invalid type ${token.type}`)
    }
  }

  return { comments, references, flags, ...values }
}

module.exports = parser
