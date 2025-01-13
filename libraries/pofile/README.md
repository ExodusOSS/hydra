# @exodus/pofile

Simple PO file parser

## Install

```sh
yarn add @exodus/pofile
```

## Usage

```js
const PO = require('@exodus/po')

const poContent = `
#: ./src/index.js
msgid "Test message"
msgstr "Mensaje de prueba"

# Other comment
#: ./src/ui.js
msgid "Test dynamic message {assetName}"
msgstr "Mensaje dinámico de prueba {assetName}"
`

const instance = PO.parse(poContent)

console.log(instance.entries)
// [
//   {
//     comments: [],
//     references: ['./src/index.js'],
//     msgid: 'Test message',
//     msgstr: 'Mensaje de prueba'
//   },
//   {
//     comments: ['Other comment'],
//     references: ['./src/ui.js'],
//     msgid: 'Test dynamic message {assetName}',
//     msgstr: 'Mensaje dinámico de prueba {assetName}'
//   }
// ]

instance.addEntry({
  id: 'Welcome to Exodus',
  value: 'Bienvenido a Exodus',
  comments: ['Some comment'],
})

console.log(instance.toString())
// #: ./src/index.js
// msgid "Test message"
// msgstr "Mensaje de prueba"

// # Other comment
// #: ./src/ui.js
// msgid "Test dynamic message {assetName}"
// msgstr "Mensaje dinámico de prueba {assetName}"
//
// #: Some comment
// msgid "Welcome to Exodus"
// msgstr "Bienvenido a Exodus"
```

### Computed IDs for messages

By default a `POFile` will not use the `msgid` property as-is to identify a message, instead
it will compute an internal id with normalized variables. This allows this lib to re-use a
translation when just the variable name is different.

```sh
# msgid
Click on\n{name} button

# computed id
Click on\n{} button
```

You can disable this behaviour by specifying `computedIdsEnabled` as `false` when reating a `POFile`.

```js
new POFile({ computedIdsEnabled: false })
```
