# @exodus/svg-safe

Validates that a string is a valid SVG XML.

## Install

```sh
yarn add @exodus/svg-safe
```

## Usage

```js
import { validate } from '@exodus/svg-safe'

try {
  validate(svgStr)
} catch (err) {
  // svg is invalid
}
```
