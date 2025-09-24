# @exodus/currency

A heavily tested JavaScript library to handle arbitrary precision numbers with units.

## Why?

A number without units is meaningless. Negligence with units can lead to catastrophes. Consider these famous incidents...

1. **Mars Surveyor '98 Orbiter**

From https://en.wikipedia.org/wiki/Mars_Climate_Orbiter:

> However, on September 23, 1999, communication with the spacecraft was lost as the spacecraft went into orbital insertion, due to ground-based computer software which produced output in non-SI units of pound-seconds (lbf s) instead of the metric units of newton-seconds (N s) specified in the contract between NASA and Lockheed. The spacecraft encountered Mars on a trajectory that brought it too close to the planet, causing it to pass through the upper atmosphere and disintegrate.

2. **Air Canada Flight 143**

From https://en.wikipedia.org/wiki/Gimli_Glider:

> ...ran out of fuel at an altitude of 12,500 metres (41,000 ft) MSL, about halfway through its flight originating in Montreal to Edmonton. The crew were able to glide the aircraft safely to an emergency landing at Gimli Industrial Park Airport, a former Royal Canadian Air Force base in Gimli, Manitoba.[1]

> The subsequent investigation revealed a combination of company failures and a chain of human errors that defeated built-in safeguards. Fuel loading was miscalculated because of a misunderstanding of the recently adopted metric system which replaced the imperial system.

---

If you're writing software that **handles people's money** (http://www.exodus.com/), you can't afford to be wrong. **That's why
this library was built.**

## Install

```sh
yarn add @exodus/currency
```

## Important Concepts

### UnitType

A UnitType defines a family of units. Examples:

- USD: Dollars and cents
- Ethereum: ETH, finney, szaboe, wei, gwei, ...
- Bitcoin: bitcoin, bits, satoshis
- Metric weight: kg, g, mg, ...

Depending on your use case, you can define your units more or less exhaustively, e.g. for Ethereum you may only need `ETH` and `wei` and omit the expialadocious.

UnitType can be used to parse strings like `1 BTC` or `100000000 satoshis` back to NumberUnit instances.

#### UnitType.prototype.baseUnit

The smallest indivisible unit of a family is called the base unit. Every other unit in the family defines its relationship to the smallest unit with a `power`, such that the unit has `10 ^ power` base unit. For example, in the bitcoin family, the `BTC` unit is defined as having power 8 because 10^8 satoshis make up 1 bitcoin. Only base 10 unit types are supported at this time. The base unit has `power === 0`.

#### UnitType.prototype.defaultUnit

The unit with the largest `power` in the family is called the default unit.

### NumberUnit

A NumberUnit is an immutable wrapper for a number with a given UnitType. It can be used to:

- Perform arithmetic with other NumberUnit instances in the same family, e.g. adding dollars and cents.
- Compare NumberUnit instances in the same family.
- Perform arithmetic with numbers, e.g. `amount.mul(2)`.
- Serialize to human readable formats, e.g. `1 BTC` or `100000000 satoshis`.

IMPORTANT: NumberUnit operations only make sense for units in the same family:

- :white_check_mark: `bitcoinAmount.add(satoshisAmount)`
- :x: `bitcoinAmount.add(etherAmount)`

To convert _beween_ units from different families, e.g. bitcoin -> USD, use the [conversion](#unittype-conversion) utility.

## Usage

### Example

```js
import NumberUnit, { UnitType } from '@exodus/currency'

// create a unit family
const bitcoin = UnitType.create({ satoshis: 0, bits: 2, BTC: 8 }) // 1 BTC = 10^8 satoshis; 1 bit = 10^2 satoshis
bitcoin.units.satoshis === bitcoin.baseUnit // true
bitcoin.units.BTC === bitcoin.defaultUnit // true

// now create a NumberUnit
const amount1 = NumberUnit.create(1.53, bitcoin.units.BTC) // alternatively: `bitcoin.defaultUnit(1.53)`
const amount2 = NumberUnit.create('1530000', bitcoin.units.bits) // notice it can accept number strings

// when serializing, be sure to provide the right unit
amount1.toString({ unitInstance: bitcoin.units.BTC }) // '1.53 BTC'
amount1.toString({ unitInstance: bitcoin.units.bits }) // '1530000 bits'
amount2.toString({ unitInstance: bitcoin.units.BTC }) // '1.53 BTC'
amount2.toString({ unitInstance: bitcoin.units.bits }) // '1530000 bits'

// compare numerical values
amount1.equals(amount2) // true
```

### UnitType

#### UnitType.create(units)

**Parameters**

- `units`: Object mapping a unit name to its [power](#unittypeprototypebaseunit), i.e. `{ [unitName]: power }`

**Returns**: a `UnitType` instance.

**Example:**

```js
import { UnitType } from '@exodus/currency'

const bitcoin = UnitType.create({ satoshis: 0, bits: 2, BTC: 8 })
```

#### UnitType.prototype.parse(numberUnitString)

**Parameters**

- `numberUnitString`: a serialized NumberUnit. See [NumberUnit.prototype.toString](#numberunitprototypetostring-unit-unitinstance-format).

**Returns:** an instance of `NumberUnit`.

```js
const amount = bitcoin.parse('1.53 BTC')
amount.toNumber(bitcoin.defaultUnit) // 1.53
```

#### UnitType.prototype.ZERO

Convenience property for a 0-valued `NumberUnit`.

```js
bitcoin.ZERO.toBaseNumber() // 0
bitcoin.ZERO.toDefaultNumber() // 0
```

### NumberUnit

**Note:** `NumberUnit` instances are immutable. All `NumberUnit` instance methods return either new instances of `NumberUnit`, or in some cases, the unmodified `NumberUnit` itself, for optimization purposes.

```js
const amount0 = bitcoin.defaultUnit(3.5)
const amount1 = bitcoin.defaultUnit(3.5)
const amount2 = bitcoin.defaultUnit(4)
amount0 instanceof NumberUnit // true
amount0 === amount2 // false as the underlying amounts are different
amount0 === amount1 // even though the underlying units and amounts are the same, do NOT rely on this always being false. Use amount0.equals(amount1) to be sure
```

#### NumberUnit.prototype.abs()

**Returns:** a new instance of `NumberUnit` with the absolute value of the number.

**Example:**

```js
const amount = bitcoin.defaultUnit(-3.5)
amount.abs().toNumber(bitcoin.defaultUnit) // 3.5
```

#### NumberUnit.prototype.add(numberUnit)

**Returns:** a new instance of `NumberUnit` that represents the sum of the two numbers.

**Example:**

```js
const amount = bitcoin.defaultUnit(-3.5)
const sum = amount.add(bitcoin.parse('1000000 bits'))
sum.toString({ unitInstance: bitcoin.defaultUnit }) // '-2.5 BTC'
```

#### NumberUnit.prototype.clampLowerZero()

**Returns:** An instance of NumberUnit that's the NumberUnit equivalent of `num = Math.max(num, 0)`

**Example:**

```js
bitcoin.defaultUnit(1.53).clampLowerZero().toDefaultString({ unit: true }) // '1.53 BTC'

bitcoin.defaultUnit(-1.53).clampLowerZero().toDefaultString({ unit: true }) // '0 BTC'
```

#### NumberUnit.prototype.clone()

**Returns:** New instance of `NumberUnit` with the same value.

**Example:**

```js
const amount = bitcoin.BTC(1.3)
const amount2 = amount.clone()
amount2.toDefaultString({ unit: true }) // '1.3 BTC'
```

#### NumberUnit.prototype.equals(numberUnit)

Unit-agnostic equality check (e.g. `1000 m === 1 km`)

**Parameters:**

- `numberUnit`: instance of a `NumberUnit` to compare with.

**Returns:** A `boolean`.

**Example:**

```js
const distance1 = distanceSI.parse('1 km')
const distance2 = distanceSI.parse('1000 m')

distance1.equals(distance2) // true
```

#### NumberUnit.prototype.gt(numberUnit)

Unit-agnostic check for whether a number unit is greater than another number unit (e.g. `1.1 km > 1000 m`).

**Parameters:**

- `numberUnit`: Another of instance of a `NumberUnit`.

**Returns:** A `boolean`, `true` if it's greater than the passed in `numberUnit`.

**Example:**

```js
const distance1 = distanceSI.parse('1.1 km')
const distance2 = distanceSI.parse('1000 m')

distance1.gt(distance2) // true
```

#### NumberUnit.prototype.gte(numberUnit)

Unit-agnostic check for whether a number unit is greater than or equal to another number unit (e.g. `1.1 km >= 1000 m`).

**Parameters:**

- `numberUnit`: Another of instance of a `NumberUnit`.

**Returns:** A `boolean`, `true` if it's greater than or equal to the passed in `numberUnit`.

**Example:**

```js
const distance1 = distanceSI.parse('1.1 km')
const distance2 = distanceSI.parse('1000 m')

distance1.gte(distance2) // true
```

#### NumberUnit.prototype.isZero()

Returns `true` or `false` depending upon whether the number is `0`.

**Signature:** `isZero()`

**Parameters:** (none)

**Returns:** A `boolean` depending upon whether the number is `0`.

**Example:**

```js
bitcoin.BTC(0).isZero() // true
bitcoin.BTC(-1).isZero() // false
```

#### NumberUnit.prototype.lt(numberUnit)

Unit-agnostic check for whether a number unit is less than another number unit (e.g. `1000 m < 1.1 km`).

**Parameters:**

- `numberUnit`: Another of instance of a `NumberUnit`.

**Returns:** A `boolean`, `true` if it's less than the passed in `numberUnit`.

**Example:**

```js
const distance1 = distanceSI.parse('1000 m')
const distance2 = distanceSI.parse('1.1 km')

distance1.lt(distance2) // true
```

#### NumberUnit.prototype.lte(numberUnit)

Unit-agnostic check for whether a number unit is less than or equal to another number unit (e.g. `1000 m <= 1.1 km`).

**Parameters:**

- `numberUnit`: Another of instance of a `NumberUnit`.

**Returns:** A `boolean`, `true` if it's less than or equal to the passed in `numberUnit`.

**Example:**

```js
const distance1 = distanceSI.parse('1000 m')
const distance2 = distanceSI.parse('1.1 km')

distance1.lt(distance2) // true
```

#### NumberUnit.prototype.negate()

Negate the number.

**Returns:** New instance of `NumberUnit` with the number negated.

**Example:**

```js
const distance1 = distanceSI.parse('1 km')
const distance2 = distance1.negate()

distance3.toDefaultString({ unit: true }) // '-1 km'
```

#### NumberUnit.prototype.sub(numberUnit)

Calculate the difference between two numbers.

**Parameters:**

- `numberUnit`: Another of instance of a `NumberUnit`.

**Returns:** An instance of NumberUnit that represents the difference between the two.

**Example:**

```js
const distance1 = distanceSI.parse('3 km')
const distance2 = distanceSI.parse('1000 m')
const distance3 = distance1.subtract(distance2)

distance3.toDefaultString({ unit: true }) // '2 km'
```

#### NumberUnit.prototype.mul(numberLike)

Multiply a NumberUnit by a scalar.

**Parameters:**

- `numberLike`: a number or number string, e.g. `100` or `'100'`

**Returns:** the NumberUnit scaled by the `numberLike` multiplier.

**Example:**

```js
const distance1 = distanceSI.parse('3 km')
const distance2 = distance1.mul(2)
distance3.toDefaultString({ unit: true }) // '6 km'
```

#### NumberUnit.prototype.div(numberLike)

Divide a NumberUnit by a scalar.

**Parameters:**

- `numberLike`: a number or number string, e.g. `100` or `'100'`

**Returns:** the NumberUnit scaled by the `numberLike` divisor.

**Example:**

```js
const distance1 = distanceSI.parse('3 km')
const distance2 = distance1.mul(2)
distance3.toDefaultString({ unit: true }) // '6 km'
```

#### NumberUnit.prototype.toString({ unit, unitInstance, format })

Serialize a `NumberUnit` to a `string`.

**Signature:** `toString([options])`

**Parameters:** `options`, type of `object`. Optional.

- `unitInstance`: the units to use in the string representation.
- `unit`: `boolean`, defaults to `true`. If `true`, include the unit string.

**Returns:** A `string` representing the number and optionally the unit.

**Example:**

```js
const bitcoin = UnitType.create({ satoshis: 0, bits: 2, BTC: 8 })
const amount1 = bitcoin.parse('1.5 BTC')
amount1.toString({ unitInstance: bitcoin.units.BTC }) // '1.5 BTC'
amount1.toString({ unitInstance: bitcoin.units.BTC, unit: false }) // '1.5'
amount1.toString({ unitInstance: bitcoin.units.bits }) // '1500000 bits'
```

#### NumberUnit.prototype.toBaseString({ unit = false } = {})

Serialize a `NumberUnit` to a `string`, using its [base unit](#unittypeprototypebaseunit).

**Parameters**

- `unit`: if `true`, include the unit string.

**Returns:** A `string` representing the number in terms of the [base unit](#unittypeprototypebaseunit).

**Example:**

```js
const bitcoin = UnitType.create({ satoshis: 0, bits: 2, BTC: 8 })
const amount1 = bitcoin.parse('1.5 BTC')
amount1.toDefaultString() // '1.5'
amount1.toDefaultString({ unit: true }) // '1.5 BTC'
```

#### NumberUnit.prototype.toDefaultString({ unit = false } = {})

Serialize a `NumberUnit` to a `string`, using its [default unit](#unittypeprototypedefaultunit).

**Parameters**

- `unit`: if `true`, include the unit string.

**Returns:** A `string` representing the number in terms of the [default unit](#unittypeprototypedefaultunit).

**Example:**

```js
const bitcoin = UnitType.create({ satoshis: 0, bits: 2, BTC: 8 })
const amount1 = bitcoin.parse('1.5 BTC')
amount1.toDefaultString() // '1.5'
amount1.toDefaultString({ unit: true }) // '1.5 BTC'
```

#### NumberUnit.prototype.isNegative

`boolean` property, `true` if number is negative.

**Example:**

```js
const bitcoin = UnitType.create({ satoshis: 0, bits: 2, BTC: 8 })
const amount1 = bitcoin.defaultUnit(-1.5)
amount1.isNegative // true
```

#### NumberUnit.prototype.isPositive

`boolean` property, `true` if number is positive.

**Example:**

```js
const bitcoin = UnitType.create({ satoshis: 0, bits: 2, BTC: 8 })
const amount1 = bitcoin.defaultUnit(1.5)
amount1.isPositive // true
```

## UnitType Conversion

To convert between different families of units, e.g. bitcoin -> ethereum based on a known exchange rate, use the conversionByRate utility.

```js
import { conversionByRate } from '@exodus/currency'

// define the conversion rate, e.g. 1 BTC = 10 ETH
const bitcoin = UnitType.create({ satoshis: 0, bits: 2, BTC: 8 })
const ethereum = UnitType.create({ wei: 0, ETH: 18 })
const convert = conversionByRate(bitcoin, ethereum, 10)
const etherAmount = convert(bitcoin.defaultUnit(2))
etherAmount.toDefaultString({ unit: true }) // '20 ETH'
```

## Usage with Assets

```js
import assets from '@exodus/assets-base'
import { UnitType } from '@exodus/currency'

const ether = UnitType.create(assets.ethereum.units)

const e1 = ether.defaultUnit(2)
const e2 = ether.parse('2 ETH')
const e3 = e2.add(ether.units.ETH(3))

e1.equals(e2) // true
e3.toDefaultString() // '5'
e3.toDefaultNumber() // 5
e3.toString({ unitInstance: ether.units.ETH }) // '5 ETH'
e3.toBaseString() // '5000000000000000000'
e3.toString({ unitInstance: ether.units.wei }) // '5000000000000000000 wei'
e3.toString({ unitInstance: ether.units.Gwei }) // '5000000000 Gwei'
```
