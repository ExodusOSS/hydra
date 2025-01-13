# @exodus/geolocation

Differently than other modules, this one only exports the atom as geolocation is a read only data source and module itself does not have any action nor should be consumed directly.

## Usage

```js
import geolocationMonitorDefinition from '@exodus/geolocation/monitor'
import { geolocationAtomDefinition } from '@exodus/geolocation/atoms'

ioc.registerMultiple([geolocationMonitorDefinition, geolocationAtomDefinition])
ioc.resolve()

const { geolocationAtom } = ioc.getByType('atom')

// get current geolocation
const {
  // ...
  ip,
  countryName,
  countryCode,
  regionName,
  regionCode,
  isAllowed,
  isProxy,
} = await geolocationAtom.get()

// subscribe to geolocation changes
geolocationAtom.observe((geolocation) => {})
```
