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
})
