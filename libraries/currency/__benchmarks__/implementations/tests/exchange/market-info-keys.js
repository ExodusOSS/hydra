import lodash from 'lodash'
import pairsFixture from './pairs.json'

const marketInfo = pairsFixture.data

export default (assets) => {
  if (!Array.isArray(marketInfo) || marketInfo.length === 0) return {}

  const symbolMap = Object.keys(assets).reduce(
    (map, assetName) => ({
      ...map,
      [assets[assetName].defaultUnit.toString()]: assetName,
    }),
    {}
  )

  return marketInfo.reduce((marketInfoKeys, info) => {
    const [fromCoin, toCoin] = info.pair.split('_').map((i) => symbolMap[i])
    if (fromCoin && toCoin) {
      lodash.set(marketInfoKeys, `${fromCoin}.${toCoin}`, lodash.cloneDeep(info))
    }
    return marketInfoKeys
  }, {})
}
