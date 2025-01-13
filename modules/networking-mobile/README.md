# @exodus/networking-mobile

This repository contains the implementation of the [@exodus/networking-spec](https://github.com/ExodusMovement/exodus-hydra/tree/master/modules/networking-spec)
for React Native contexts.

## Installing

```sh
yarn add @exodus/networking-mobile
```

## Usage

The following sections will outline how to use the various modules that are part
of this package.

### @exodus/networking-mobile/http + form

The React Native fetch implementation does not support a spec compliant `FormData` object.
In order to have an API that is similar to what we are used to from the Browser, this module ships with its own
`FormData` implementation.

To use it, import it and add data as you're used to:

```ts
import { FormData } from '@exodus/networking-mobile/form'

const formData = new FormData()
formData.append('name', 'Bruce Wayne')

// set is also available
formData.set('name', 'Batman')

// ...and many more: delete, get, getAll, entries, keys, values
```

As opposed to the Browser implementation, the RN `FormData` is not just a data container, but also knows how to
serialize itself. Therefore the `FormData` implementation shipping with this module (which follows the Browser spec),
cannot directly be used with RN's `fetch`.

To overcome this limitation, use the `HttpClient` that is part of this
module. It comes with a `fetch` function that has the same signature as RN's `fetch` but can handle our `FormData`.

```ts
import { FormData, File } from '@exodus/networking-mobile/form'
import { HttpClient } from '@exodus/networking-mobile/http'
import RNFS from '@exodus/react-native-fs'

const client = new HttpClient(RNFS, 'android', uuidv4)

const formData = new FormData()
formData.set('passport', new File(buffer, 'passport.jpg'))

await client.fetch('https://wayne.enterprises/upload', { method: 'POST', body: formData })
```

The client transforms `FormData` by writing files to the temporary folder, and appending the file URI, MIME type,
and file name to an RN `FormData` object that is then passed to RN's `fetch`. Any temporarily created files are
removed when the requests completes - successfully or otherwise.

Please note that the file used above is also provided by this module. It receives an object of type `Buffer`, a name,
and optional properties to set the MIME type and last modified date. The MIME type takes no effect if used in conjunction
with the `HttpClient`, since the client automatically derives the MIME type from the file extension.

### @exodus/networking-mobile/cookie

The mobile `CookieJar` has to be instantiated with the platform it is running on.

```ts
import { CookieJar } from '@exodus/networking-browser/cookie'

const jar = new CookieJar('android')
```

A cookie can be removed by specifying its host and name (and optionally its path)

```ts
await jar.remove({ name: 'csrf', host: 'sub.domain.com' })
```

To get rid of all cookies, use the following:

```ts
await jar.removeAll()
```
