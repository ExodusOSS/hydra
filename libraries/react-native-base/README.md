[![Release](https://github.com/ExodusMovement/react-native-base/actions/workflows/release.yml/badge.svg)](https://github.com/ExodusMovement/react-native-base/actions/workflows/release.yml) [![Checks](https://github.com/ExodusMovement/react-native-base/actions/workflows/checks.yml/badge.svg)](https://github.com/ExodusMovement/react-native-base/actions/workflows/checks.yml)

## @exodus/react-native-base

Common build config, shims, and patches used across the Exodus RN universe.

### Shims

Import the shim factory in your entry point

```js
// index.js
import { isDev } from '~/constants/genesis'
import createShims from '@exodus/react-native-base/shims'

createShims({ isDev: typeof isDev === 'boolean' && isDev })

require('./main.js') // important: this has to be required after the shims are created
```

### Babel

Import the factory in your prod babel config and add an instance to presets:

```js
// babel.config.js

const { createBabelConfig } = require('@exodus/react-native-base/babel')

module.exports = {
  presets: [createBabelConfig({ aliases })],
  // ... customize
}
```

Make sure to configure the aliases you are planning on using from here in the eslint config for `import/resolver`:

```js
// .eslintrc.js

const aliases = require('./src/babel-module-aliases')
const { aliases: defaultAliases } = require('./src/node_modules/@exodus/react-native-base/babel')

const resolverSettings = Object.entries({
  ...defaultAliases,
  ...aliases,
  '@exodus/web3-ethereum/lib/provider': '@exodus/web3-ethereum/provider',
})

module.exports = {
  // ...
  settings: {
    'import/resolver': {
      alias: {
        map: resolverSettings,
        // ...
      },
    },
  },
  // ...
}
```
