const transform = require('../../babel/transform.js')

describe('i18n po loader', () => {
  test('should parse simple po entry', () => {
    const code = transform(`
      msgid "Select Language"
      msgstr "Selecciona el idioma"
    `)

    expect(code).toMatchSnapshot()
  })

  test('should parse comments', () => {
    const code = transform(`
      #: src/ui/screens/ChangeLanguage/ChangeLanguage.js:48
      msgid "Select Language"
      msgstr "Selecciona el idioma"
    `)

    expect(code).toMatchSnapshot()
  })

  test('should parse dynamic values', () => {
    const code = transform(`
      #: src/ui/screens/Receive/Receive.js:50
      msgid "Your {asset.properName} Address"
      msgstr "Su dirección de {asset.properName}"
    `)

    expect(code).toMatchSnapshot()
  })

  test('should parse numeric values', () => {
    const code = transform(`
      #: src/ui/screens/Receive/Receive.js:50
      msgid "Progress of {n}%"
      msgstr "Progreso de {n, number}%"

      #: src/ui/screens/Receive/Receive.js:51
      msgid "You have {n}"
      msgstr "Tienes {n, amount}"
    `)
    expect(code).toMatchSnapshot()
  })
  test('should parse fiat subtype', () => {
    const code = transform(`
      #: src/ui/screens/Receive/Receive.js:50
      msgid "Your portfolio balance is {n}"
      msgstr "El valor de su portafolio es {n, number, currency}"
    `)
    expect(code).toMatchSnapshot()
  })

  test('should parse multiple entries', () => {
    const code = transform(`
      #: src/ui/screens/Receive/Receive.js:50
      msgid "Your {asset.properName} Address"
      msgstr "Su dirección de {asset.properName}"

      #: src/ui/components/CopyableValue/CopyableValue.js:33
      msgid "Copy"
      msgstr "Copiar"

      #: src/ui/components/CopyableValue/CopyableValue.js:64
      msgid "Copied"
      msgstr "Copiado"
    `)

    expect(code).toMatchSnapshot()
  })
})
