# @exodus/bigint

Immutable API wrapper for big integers, using BigInt if available in the JS environment and falling back to bn.js if it isn't

## Usage

```js
import BigIntWrapper from '@exodus/bigint'

const three = BigIntWrapper.wrap(3)
const five = BigIntWrapper.wrap(5)

// perform arithmetic
// see full API: ./src/native-bigint.js and ./src/__tests__/index.test.js
three.add(five).mul(three).div(five).pow(three).sub(five)
```
