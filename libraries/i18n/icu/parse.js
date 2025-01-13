const normalizeWhitespace = (text) => {
  return text.replace(/\\n/gu, '\n').replace(/\\s/gu, ' ')
}

// messageformat-parser or @messageformat/parser mock
const parse = (input) => {
  let current = 0
  let argPositionalCounter = 0

  const tokens = []

  while (current < input?.length) {
    let char = input[current]

    // Check for arguments
    if (char === '{') {
      let char = input[++current]

      let args = ''
      while (char && char !== '}') {
        args += char
        char = input[++current]
      }

      const [argName, argFormat, subType] = args.trim().split(',')
      tokens.push({
        type: 'arg',
        name: argName.trim(),
        position: argPositionalCounter,
        format: argFormat?.trim(),
        subType: subType?.trim(),
      })

      argPositionalCounter++
      current++

      continue
    }

    // Check for the rest
    let value = ''

    while (char && char !== '{') {
      value += char
      char = input[++current]
    }

    tokens.push({ type: 'text', value: normalizeWhitespace(value) })
  }

  return tokens
}

export default parse
