const bip44Constants = require('./index')

const bit44ConstantByTickerMap = Object.create(null)
for (const [c, t] of bip44Constants) {
  if (!(t in bit44ConstantByTickerMap)) {
    bit44ConstantByTickerMap[t] = c
  }
}

module.exports = bit44ConstantByTickerMap
