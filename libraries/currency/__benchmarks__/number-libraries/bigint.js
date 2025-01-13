/* global BigInt */
/* eslint no-global-assign: "off" */

const XorShift128Plus = require('xorshift.js').XorShift128Plus
const BN = require('bn.js')
const BigNumber = require('bignumber.js')
// BigRational try use BigInt if it's supported
const BigRationalNative = require('big-rational')
const BigRational = (() => {
  delete require.cache[require.resolve('big-integer')]
  delete require.cache[require.resolve('big-rational')]
  const _BigInt = BigInt
  BigInt = undefined
  const BigRational = require('big-rational')
  BigInt = _BigInt
  return BigRational
})()

// another shit about bignumber.js
BigNumber.config({ ERRORS: false, DECIMAL_PLACES: 20, precision: 20 })

// prng will give us same result every time for same seed
const seed = process.env.SEED || '0123456789abcdef0123456789abcdef'
console.log(`Seed: ${seed}`)
const prng = new XorShift128Plus(seed)

// generate numbers
const numbers = []
while (numbers.length < 100000) {
  // Number will looks like ETH as 2 digits before point
  const val = new BN(prng.randomBytes(16)).toString().slice(-20)
  numbers.push(val)
}

function timing(str, fn) {
  console.time(str)
  fn()
  console.timeEnd(str)
}

// parse
{
  const values = Array.from(numbers)
  function bench(name, fn) {
    timing(`parse (${values.length} items): ${name}`, () => {
      for (const val of values) fn(val)
    })
  }

  bench('BigInt', (x) => BigInt(x))
  bench('bn.js', (x) => new BN(x))
  bench('bignumber.js', (x) => new BigNumber(x))
  bench('big-rational (BigInt)', (x) => new BigRationalNative(x))
  bench('big-rational', (x) => new BigRational(x))
}

// toString
{
  function bench(name, values) {
    timing(`toString (${values.length} items): ${name}`, () => {
      for (const val of values) val.toString()
    })
  }

  bench('BigInt', numbers.map((x) => BigInt(x)))
  bench('bn.js', numbers.map((x) => new BN(x)))
  bench('bignumber.js', numbers.map((x) => new BigNumber(x)))
  bench('big-rational (BigInt)', numbers.map((x) => new BigRationalNative(x)))
  bench('big-rational', numbers.map((x) => new BigRational(x)))
}

// add/sub
{
  function bench(name, values, number, addFn, subFn) {
    timing(`add/sub (${values.length * 2} items): ${name}`, () => {
      for (const val of values) number = addFn(number, val)
      for (const val of values) number = subFn(number, val)
    })
  }

  bench('BigInt', numbers.map((x) => BigInt(x)), BigInt(0), (a, b) => a + b, (a, b) => a - b)
  bench(
    'bn.js (in-place)',
    numbers.map((x) => new BN(x)),
    new BN(0),
    (a, b) => a.iadd(b),
    (a, b) => a.isub(b)
  )
  bench('bn.js', numbers.map((x) => new BN(x)), new BN(0), (a, b) => a.add(b), (a, b) => a.sub(b))
  bench(
    'bignumber.js',
    numbers.map((x) => new BigNumber(x)),
    new BigNumber(0),
    (a, b) => a.plus(b),
    (a, b) => a.minus(b)
  )
  bench(
    'big-rational (BigInt)',
    numbers.map((x) => new BigRationalNative(x)),
    new BigRational(0),
    (a, b) => a.plus(b),
    (a, b) => a.minus(b)
  )
  bench(
    'big-rational',
    numbers.map((x) => new BigRational(x)),
    new BigRational(0),
    (a, b) => a.plus(b),
    (a, b) => a.minus(b)
  )
}

// mul
{
  function bench(name, values, mulFn) {
    timing(`mul (${values.length - 1} items): ${name}`, () => {
      for (let i = 1; i < values.length; ++i) mulFn(values[i - 1], values[i])
    })
  }

  bench('BigInt', numbers.map((x) => BigInt(x)), (a, b) => a * b)
  bench('bn.js', numbers.map((x) => new BN(x)), (a, b) => a.mul(b))
  bench('bignumber.js', numbers.map((x) => new BigNumber(x)), (a, b) => a.times(b))
  bench('big-rational (BigInt)', numbers.map((x) => new BigRationalNative(x)), (a, b) => {
    return a.multiply(b)
  })
  bench('big-rational', numbers.map((x) => new BigRational(x)), (a, b) => a.multiply(b))
}
