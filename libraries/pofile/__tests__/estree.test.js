const fs = require('fs')
const path = require('path')
const estree = require('../src/estree')

const filePath = './fixtures/test.po'
const data = fs.readFileSync(path.join(__dirname, filePath)).toString()

describe('estree', () => {
  test('should have program', () => {
    const program = estree(data, filePath)

    expect(program.type).toEqual('Program')
    expect(program.body).toBeInstanceOf(Array)
    expect(program.loc).toEqual({
      start: { line: 1, column: 0 },
      end: { line: 27, column: 45 },
      source: filePath,
    })
  })

  test('should map sections to blocks', () => {
    const program = estree(data, filePath)

    const section = program.body[0]
    expect(section.type).toEqual('BlockStatement')
    expect(section.loc).toEqual({
      start: { line: 1, column: 0 },
      end: { line: 3, column: 20 },
      source: filePath,
    })
  })

  test('should map comments to lines', () => {
    const program = estree(data, filePath)

    const firstBlock = program.body[0]
    const comment = firstBlock.body[0]
    expect(comment.type).toEqual('Line')
    expect(comment.loc).toEqual({
      start: { line: 1, column: 0 },
      end: { line: 1, column: 22 },
      source: filePath,
    })
  })

  test('should map messages to objects', () => {
    const program = estree(data, filePath)

    const firstBlock = program.body[0]
    const object = firstBlock.body[1]
    expect(object.type).toEqual('ObjectExpression')
    expect(object.properties).toBeInstanceOf(Array)
    expect(object.loc).toEqual({
      start: { line: 2, column: 0 },
      end: { line: 3, column: 20 },
      source: filePath,
    })
  })

  test('should map properties of messages', () => {
    const program = estree(data, filePath)

    const firstBlock = program.body[0]
    const { properties } = firstBlock.body[1]

    const msgid = properties[0]
    expect(msgid.type).toEqual('Property')
    expect(msgid.kind).toEqual('init')
    expect(msgid.loc).toEqual({
      start: { line: 2, column: 0 },
      end: { line: 2, column: 14 },
      source: filePath,
    })

    const msgstr = properties[1]
    expect(msgstr.type).toEqual('Property')
    expect(msgstr.kind).toEqual('init')
    expect(msgstr.loc).toEqual({
      start: { line: 3, column: 0 },
      end: { line: 3, column: 20 },
      source: filePath,
    })
  })

  test('should map keys of properties', () => {
    const program = estree(data, filePath)

    const firstBlock = program.body[0]
    const { properties } = firstBlock.body[1]

    const msgidKey = properties[0].key
    expect(msgidKey.type).toEqual('Identifier')
    expect(msgidKey.name).toEqual('msgid')
    expect(msgidKey.loc).toEqual({
      start: { line: 2, column: 0 },
      end: { line: 2, column: 5 },
      source: filePath,
    })
    expect(msgidKey.range).toEqual([23, 28])

    const msgstrKey = properties[1].key
    expect(msgstrKey.type).toEqual('Identifier')
    expect(msgstrKey.name).toEqual('msgstr')
    expect(msgstrKey.loc).toEqual({
      start: { line: 3, column: 0 },
      end: { line: 3, column: 6 },
      source: filePath,
    })
    expect(msgstrKey.range).toEqual([38, 44])
  })

  test('should map values of properties', () => {
    const program = estree(data, filePath)

    const firstBlock = program.body[0]
    const { properties } = firstBlock.body[1]

    const msgidValue = properties[0].value
    expect(msgidValue.type).toEqual('Literal')
    expect(msgidValue.value).toEqual('Unlock')
    expect(msgidValue.loc).toEqual({
      start: { line: 2, column: 6 },
      end: { line: 2, column: 14 },
      source: filePath,
    })
    expect(msgidValue.range).toEqual([29, 37])

    const msgstrValue = properties[1].value
    expect(msgstrValue.type).toEqual('Literal')
    expect(msgstrValue.value).toEqual('Desbloquear')
    expect(msgstrValue.loc).toEqual({
      start: { line: 3, column: 7 },
      end: { line: 3, column: 20 },
      source: filePath,
    })
    expect(msgstrValue.range).toEqual([45, 58])
  })
})
