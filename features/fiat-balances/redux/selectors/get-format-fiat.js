import { isNumberUnit } from '@exodus/currency'
import { formatPrice, getFiatAdaptiveFraction } from '@exodus/formatting/lib/price'

const resultFunction =
  (currency) =>
  (
    fiatValue,
    {
      customCurrency,
      adaptiveFraction, // use adaptiveFraction when convert crypto amount (balance for example) to fiat
      useGrouping,
    } = {}
  ) => {
    const fiatCurrency = customCurrency || currency
    const value = isNumberUnit(fiatValue) ? fiatValue.toDefaultNumber() : fiatValue

    return formatPrice(value, {
      currency: fiatCurrency,
      useGrouping,
      maxFraction: adaptiveFraction ? getFiatAdaptiveFraction(value) : undefined,
    })
  }

const getFormatFiatSelectorDefinition = {
  id: 'getFormatFiat',
  resultFunction,
  dependencies: [
    //
    { module: 'locale', selector: 'currency' },
  ],
}

export default getFormatFiatSelectorDefinition
