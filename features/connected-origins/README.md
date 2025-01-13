# @exodus/connected-origins

The connected origins module maintains a list of the third-party websites that the user has authorized to interact with Exodus. It stores the authorization status and connection status, along with metadata such as the name and icon of the website.

## Usage

To use the module call the factory and pass in required dependencies

```js
import connectedOriginsAtomDefinition from '@exodus/connected-origins/atoms'
import connectedOriginsDefinition from '@exodus/connected-origins/module'

const connectedOriginsStorage = storage.namespace('connectedOrigins')
const connectedOriginsAtom = connectedOriginsAtomDefinition.factory({
  storage: connectedOriginsStorage,
})

// create connected origins
const connectedOrigins = connectedOriginsDefinition.factory({ connectedOriginsAtom })

// load connected origins
await connectOrigins.load()

// get connected origins
await connectedOriginsAtom.get()

// clear connected origins
await connectOrigins.clear()
```
