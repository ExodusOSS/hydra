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

      // A comment is terminated by a newline OR end-of-input. The caller
      // splits sections on '\n\n', so the last comment in a section may have
      // no trailing newline; without the bounds check this would loop forever
      // because input[current] becomes undefined and `undefined !== '\n'` is
      // always true.
      while (current < input.length && char !== '\n') {
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

      // The bounds check guards against infinite loops on unterminated
      // strings. The `&& !escaped` makes the flag toggle correctly so that
      // a literal backslash sequence ('\\\\') doesn't cause the next char
      // (e.g., the closing quote) to be treated as escaped.
      while (current < input.length && (char !== '"' || escaped)) {
        escaped = char === '\\' && !escaped
        value += char
        char = input[++current]
      }

      if (char !== '"') {
        throw new TypeError('pofile: Unterminated string literal')
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

      // The bounds check guards against an infinite loop when the input
      // ends mid-name: `LETTERS.test(undefined)` is true because undefined
      // stringifies to "undefined", which matches the [a-z] character class.
      while (current < input.length && LETTERS.test(char)) {
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
