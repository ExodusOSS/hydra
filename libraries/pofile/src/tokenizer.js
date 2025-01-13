const start = (lines) => ({
  line: lines.length,
  column: lines[lines.length - 1].length,
})

const end = (lines, preceeding, current) => {
  const currentLinePreceeding = lines[lines.length - 1]

  return {
    line: lines.length,
    column: current - preceeding.length + currentLinePreceeding.length,
  }
}

const range = (preceeding, current) => [preceeding.length, current]

const tokenizer = (input) => {
  let current = 0

  const tokens = []

  while (current < input.length) {
    let char = input[current]

    const preceeding = input.slice(0, current)
    const lines = preceeding.split('\n')

    // Check for comments, references and flags.
    if (char === '#') {
      let modifier = ''
      modifier = input[++current]

      char = input[++current]

      let value = ''

      while (char !== '\n') {
        value += char
        char = input[++current]
      }

      tokens.push({
        type: 'comment',
        value: value.trim(),
        modifier,
        start: start(lines),
        end: end(lines, preceeding, current),
        range: range(preceeding, current),
      })

      current++

      continue
    }

    // Check for whitespace
    const WHITESPACE = /\s/u
    if (WHITESPACE.test(char)) {
      current++
      continue
    }

    // Checking for strings:
    if (char === '"') {
      let value = ''
      let escaped = false

      // We'll skip the opening double quote in our token.
      char = input[++current]

      while (char !== '"' || escaped) {
        escaped = char === '\\'
        value += char
        char = input[++current]
      }

      // Skip the closing double quote.
      char = input[++current]

      tokens.push({
        type: 'string',
        value,
        start: start(lines),
        end: end(lines, preceeding, current),
        range: range(preceeding, current),
      })

      continue
    }

    // Check for names
    const LETTERS = /[a-z]/iu
    if (LETTERS.test(char)) {
      let value = ''

      while (LETTERS.test(char)) {
        value += char
        char = input[++current]
      }

      tokens.push({
        type: 'name',
        value,
        start: start(lines),
        end: end(lines, preceeding, current),
        range: range(preceeding, current),
      })

      continue
    }

    throw new TypeError('pofile: Invalid char: ' + char)
  }

  return tokens
}

module.exports = tokenizer
