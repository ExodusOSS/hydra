import _marketInfoKeys from './market-info-keys'
import _marketInfoNumbers from './market-info-numbers'
import _marketInfoConversions from './market-info-conversions'
import _fiatConversions from './fiat-conversions'
import _maxesMinsToFiat from './maxes-mins-to-fiat'
import _spread from './spread'

export default (CurrencyModules) => {
  Object.keys(CurrencyModules).forEach((implementation) => {
    const label = (part) => `exchange ${implementation} ${part}`

    const currencyModule = CurrencyModules[implementation]
    const assets = currencyModule.assets

    const marketInfo = _marketInfoKeys(assets)

    console.time(label('total'))

    console.time(label('parsing'))
    const marketInfoNumbers = _marketInfoNumbers(assets, marketInfo)
    console.timeEnd(label('parsing'))

    console.time(label('preparing conversions'))
    const marketInfoConversions = _marketInfoConversions(currencyModule, marketInfoNumbers)
    const fiatConversions = _fiatConversions(currencyModule)
    console.time(label('preparing conversions'))

    console.time(label('maxes & mins to fiat'))
    _maxesMinsToFiat(marketInfoNumbers, fiatConversions)
    console.timeEnd(label('maxes & mins to fiat'))

    console.time(label('spread'))
    _spread(assets, marketInfoConversions)
    console.timeEnd(label('spread'))

    console.timeEnd(label('total'))

    console.log()
  })
}
