# @exodus/schemasafe-babel-plugin

Compiles imported JSON schemas into validator functions using `@exodus/schemasafe`.

# Usage

### Usage:
1. Add the plugin in `babel.config.js`, e.g.:

```js
module.exports = {
  plugins: [
    ['@exodus/schemasafe-babel-plugin', pluginParams],
  ]
}
```

`pluginParams` should be a valid [SchemasafeBabelPluginParams](#api-reference) object.

2. Import a JSON schema in your project:
```js
import validateData from './data.schemasafe.json'
import { validateMeta } from './meta.schemasafe.json' // Named imports also work.
```

3. After compilation the imported variables become a validator function so a consumer can use it like a normal JS function:

```js
try {
  validateData(data)
} catch (err) {
  console.log(err.message) // 'JSON validation failed for...'
}
```

### API reference

```ts
/*
  See https://github.com/ExodusMovement/schemasafe#options for all available options.
*/
interface SchemasafeOptions {
  schemas?: JsonSchema[] // Extra schemas to be referenced from a master schema.
  formats?: Object // Extra formats to be used in the supplied schemas.
  removeAdditional?: boolean // Removes non-valid properties from the original object if true.
}

interface SchemasafeBabelPluginParams {
  options: {
    globs: string[] // Global patterns to match against particular schemas.
    schemasafeOptions?: SchemasafeOptions
  }[]
}
```
Example:
```js
plugins: [
    ['@exodus/schemasafe-babel-plugin',
        { options: [
            {
                globs: ["**/src/schemas/*.schema.json"],
                schemasafeOptions: {
                    formats: { 'no-foo': (str) => !str.includes('foo') }
                }
            },
            {
                globs: ["**/node_modules/some-package/**/*.schemasafe.json"],
                schemasafeOptions: {
                    enableExtra: true,
                    removeAdditional: true
                }
            }]
        }
    ],
  ]
```