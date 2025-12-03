const { transformSync } = require('@babel/core')
const fs = require('fs')
const { when } = require('jest-when')

const plugin = require('../plugin-inline-po.js')

describe('plugin-inline-po', () => {
  const babelOptions = {
    filename: '/locales/index.js',
    plugins: [plugin],
  }

  const transformCode = (code) => {
    return transformSync(code, babelOptions).code.replaceAll('\n', '').replaceAll('  ', ' ')
  }

  const SCENARIOS = [
    { name: 'string', code: `const de = require('./de/messages.po')` },
    { name: 'template', code: 'const de = require(`./de/messages.po`)' },
  ]

  SCENARIOS.forEach(({ name, code }) =>
    describe(`required ${name}`, () => {
      let readFileSync

      beforeEach(() => {
        readFileSync = jest.spyOn(fs, 'readFileSync')
      })

      test('should inline simple PO file as object', () => {
        when(readFileSync).calledWith('/locales/de/messages.po').mockReturnValue(`
#: src/ui/screens/App/App.js:13
msgid "Out of the way, Potter!"
msgstr "Aus dem Weg, Potter!"
`)

        const transformed = transformCode(code)

        expect(transformed).toEqual(
          `const de = { "Out of the way, Potter!": [{  "type": "text",  "value": "Aus dem Weg, Potter!" }]};`
        )
      })

      test('should inline PO file with variables as object', () => {
        when(readFileSync).calledWith('/locales/de/messages.po').mockReturnValue(`
#: src/ui/screens/App/App.js:13
msgid "{character}: Out of the way, {name}!"
msgstr "{character}: Aus dem Weg, {name}!"
`)

        const transformed = transformCode(code)

        expect(transformed).toEqual(
          `const de = { "{}: Out of the way, {}!": [{  "type": "arg",  "name": "character",  "position": 0 }, {  "type": "text",  "value": ": Aus dem Weg, " }, {  "type": "arg",  "name": "name",  "position": 1 }, {  "type": "text",  "value": "!" }]};`
        )
      })

      test('should inline simple PO file as object with key computed with context', () => {
        when(readFileSync).calledWith('/locales/de/messages.po').mockReturnValue(`
#: src/ui/screens/App/App.js:13
msgid "Out of the way, Potter!"
msgstr "Aus dem Weg, Potter!"
msgctxt "app.text"
`)

        const transformed = transformCode(code)

        expect(transformed).toEqual(
          `const de = { "Out of the way, Potter!::app.text": [{  "type": "text",  "value": "Aus dem Weg, Potter!" }]};`
        )
      })
    })
  )
})
