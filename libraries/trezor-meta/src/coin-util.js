const coins = require('./data/coins')

/**
 * Finds the coin data from src/data/coins.json for a given name.
 *Throws if the coin is not found.
 * @param {string} rawName The coin's name or symbol, upper or lower case.
 */
const findCoin = (rawName) => {
  for (const coinData of coins) {
    const possibilities = [
      coinData.name,
      coinData.coin_name,
      coinData.coin_label,
      coinData.exodus_name,
      coinData.shortcut,
    ]
      .filter(Boolean)
      .map((s) => s.toLowerCase())
    if (possibilities.includes(rawName.toLowerCase())) {
      return coinData
    }
  }

  throw new Error(`not a supported coin: ${rawName}`)
}

const isSegwit = (coinName) => !!findCoin(coinName).segwit

module.exports = {
  findCoin,
  isSegwit,
}
