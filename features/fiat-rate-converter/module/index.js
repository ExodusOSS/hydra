import { conversionByRate, isNumberUnit } from '@exodus/currency'
import fiatCurrencies from '@exodus/fiat-currencies'

export const MODULE_ID = 'fiatRateConverter'

class FiatRateConverter {
  #defaultCurrency
  #ratesAtom

  constructor({ ratesAtom, config }) {
    this.#defaultCurrency = config.defaultCurrency
    this.#ratesAtom = ratesAtom
  }

  #getFiatRate = async (ticker, currency) => {
    const rates = await this.#ratesAtom.get()
    const priceKey = currency === 'USD' ? 'priceUSD' : 'price'
    return rates[currency]?.[ticker]?.[priceKey] || 0
  }

  toFiatCurrency = async ({ amount, currency = this.#defaultCurrency }) => {
    const fiatCurrency = fiatCurrencies[currency]

    if (!isNumberUnit(amount)) throw new Error(`amount must be of type NumberUnit, got: ${amount}`)
    if (!fiatCurrency) throw new Error(`currency: ${currency} not found`)

    if (amount.unitType.equals(fiatCurrency)) return amount
    const fiatRate = await this.#getFiatRate(amount.unitName, fiatCurrency.toString())

    if (!fiatRate) return fiatCurrency.ZERO

    const convertToFiat = conversionByRate(amount.unitType, fiatCurrency, fiatRate)
    return convertToFiat(amount)
  }
}

const createFiatRateConverter = (args = {}) => new FiatRateConverter({ ...args })

const fiatRateConverterDefinition = {
  id: MODULE_ID,
  type: 'module',
  factory: createFiatRateConverter,
  dependencies: ['ratesAtom', 'config'],
  public: true,
}

export default fiatRateConverterDefinition
