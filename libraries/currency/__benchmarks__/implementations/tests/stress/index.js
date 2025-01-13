const XorShift128Plus = require('xorshift.js').XorShift128Plus

// prng will give us same result every time for same seed
const seed = process.env.SEED || '0123456789abcdef0123456789abcdef'
const prng = new XorShift128Plus(seed)

const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
function getNumber(count) {
  let output = ''
  for (let j = 0; j < count; j++) {
    output += numbers[Math.round(prng.random() * (numbers.length - 1))]
  }
  return output
}

const rawAmounts = []
const rawAmountsFloat = []

for (let i = 0; i < 100000; i++) {
  const digits = prng.random() * 40
  const decimals = prng.random() * 40
  const value = `${getNumber(digits)}.${getNumber(decimals)}`
  rawAmounts.push(value)
  rawAmountsFloat.push(parseFloat(value))
}

export default (CurrencyModules) => {
  Object.keys(CurrencyModules).forEach((implementation) => {
    const label = (part) => `stress ${implementation} ${part}`

    const { ethereum, bitcoin } = CurrencyModules[implementation].assets

    console.time(label('total'))

    console.time(label('parse string'))
    const amounts = rawAmounts.map((raw) => ethereum.parse(raw + ' ETH'))
    console.timeEnd(label('parse string'))

    console.time(label('parse number'))
    rawAmountsFloat.map((raw) => ethereum.ETH(raw))
    console.timeEnd(label('parse number'))

    console.time(label('clampLowerZero'))
    amounts.forEach((a) => a.clampLowerZero())
    console.timeEnd(label('clampLowerZero'))

    console.time(label('add'))
    amounts.forEach((a, i) => a.add(amounts[amounts.length - 1 - i]))
    console.timeEnd(label('add'))

    console.time(label('sub'))
    amounts.forEach((a, i) => a.sub(amounts[amounts.length - 1 - i]))
    console.timeEnd(label('sub'))

    console.time(label('mul'))
    amounts.forEach((a, i) => a.mul(rawAmounts[rawAmounts.length - 1 - i]))
    console.timeEnd(label('mul'))

    console.time(label('toBase'))
    amounts.forEach((a) => a.toBase())
    console.timeEnd(label('toBase'))

    console.time(label('toDefault'))
    amounts.forEach((a) => a.toDefault())
    console.timeEnd(label('toDefault'))

    console.time(label('toNumber'))
    amounts.forEach((a) => a.toNumber())
    console.timeEnd(label('toNumber'))

    console.time(label('toString'))
    amounts.forEach((a) => a.toString())
    console.timeEnd(label('toString'))

    console.time(label('cast'))
    amounts.forEach((a) => a.cast?.(bitcoin))
    console.timeEnd(label('cast'))

    console.timeEnd(label('total'))

    console.log()
  })
}
