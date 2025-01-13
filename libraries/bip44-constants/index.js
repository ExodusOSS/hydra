const baseConstants = require('./base')

const bip44Constants = [...baseConstants]

bip44Constants.push([0x8000022a, 'FLR', 'Flare'])

module.exports = bip44Constants
