const fs = require('fs')
const path = require('path')
const tokenizer = require('../src/tokenizer')

const data = fs.readFileSync(path.join(__dirname, './fixtures/test.po')).toString()

describe('tokenizer', () => {
  test('should determine comment', () => {
    const tokens = tokenizer(data)

    const firstComment = tokens[0]
    expect(firstComment.value).toEqual('src/Component.js:76')
  })

  test('should determine entry key', () => {
    const tokens = tokenizer(data)

    const firstEntryIdentifierKey = tokens[1]
    expect(firstEntryIdentifierKey.value).toEqual('msgid')

    const secondEntryStringKey = tokens[8]
    expect(secondEntryStringKey.value).toEqual('msgstr')
  })

  test('should determine entry value', () => {
    const tokens = tokenizer(data)

    const firstEntryIdentifierValue = tokens[2]
    expect(firstEntryIdentifierValue.value).toEqual('Unlock')

    const secondEntryStringValue = tokens[9]
    expect(secondEntryStringValue.value).toEqual('Contraseña')
  })

  test('should determine start', () => {
    const tokens = tokenizer(data)

    const firstComment = tokens[0]
    expect(firstComment.start.line).toEqual(1)
    expect(firstComment.start.column).toEqual(0)

    const secondEntryStringValue = tokens[9]
    expect(secondEntryStringValue.start.line).toEqual(7)
    expect(secondEntryStringValue.start.column).toEqual(7)
  })

  test('should determine end', () => {
    const tokens = tokenizer(data)

    const firstComment = tokens[0]
    expect(firstComment.end.line).toEqual(1)
    expect(firstComment.end.column).toEqual(22)

    const secondEntryStringValue = tokens[9]
    expect(secondEntryStringValue.end.line).toEqual(7)
    expect(secondEntryStringValue.end.column).toEqual(19)
  })

  test('should include range based on absolute index in file', () => {
    const tokens = tokenizer(data)

    const firstComment = tokens[0]
    expect(firstComment.range).toEqual([0, 22])

    const firstEntryIdentifierKey = tokens[1]
    expect(firstEntryIdentifierKey.range).toEqual([23, 28])

    const secondEntryStringValue = tokens[9]
    expect(secondEntryStringValue.range).toEqual([113, 125])
  })

  describe('malformed input', () => {
    test('terminates a comment that has no trailing newline (last line of section)', () => {
      const tokens = tokenizer('# trailing comment without newline')

      expect(tokens).toHaveLength(1)
      expect(tokens[0]).toMatchObject({
        type: 'comment',
        value: 'trailing comment without newline',
      })
    })

    test('terminates a section that ends with a comment after entries', () => {
      const input = 'msgid "Hello"\nmsgstr "Hola"\n# trailing comment'
      const tokens = tokenizer(input)

      const lastToken = tokens[tokens.length - 1]
      expect(lastToken.type).toEqual('comment')
      expect(lastToken.value).toEqual('trailing comment')
    })

    test('throws on an unterminated string literal instead of looping forever', () => {
      expect(() => tokenizer('msgid "unterminated')).toThrow(/pofile: Unterminated string literal/u)
    })

    test('handles an escaped backslash immediately before the closing quote', () => {
      // PO source: msgstr "foo\\" — the value is `foo\`
      const input = 'msgstr "foo\\\\"'
      const tokens = tokenizer(input)

      expect(tokens).toHaveLength(2)
      expect(tokens[0]).toMatchObject({ type: 'name', value: 'msgstr' })
      expect(tokens[1]).toMatchObject({ type: 'string', value: 'foo\\\\' })
    })

    test('terminates a name token at end-of-input', () => {
      const tokens = tokenizer('msgid')

      expect(tokens).toHaveLength(1)
      expect(tokens[0]).toMatchObject({ type: 'name', value: 'msgid' })
    })

    test('handles an escaped quote inside a string', () => {
      // PO source: msgstr "say \"hi\"" — value is `say \"hi\"`
      const input = 'msgstr "say \\"hi\\""'
      const tokens = tokenizer(input)

      expect(tokens).toHaveLength(2)
      expect(tokens[1]).toMatchObject({ type: 'string', value: 'say \\"hi\\"' })
    })
  })
})
