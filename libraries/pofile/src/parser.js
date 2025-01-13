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
    const nextToken = tokens[current + 1]

    switch (token.type) {
      case 'comment':
        const storage = storageByModifier[token.modifier]
        storage.push(token.value)

        current++

        break

      case 'name':
        const key = token.value
        const value = nextToken.value

        current += 2

        values[key] = value
        break
      default:
        throw new TypeError(`Invalid type ${token.type}`)
    }
  }

  return { comments, references, flags, ...values }
}

module.exports = parser
