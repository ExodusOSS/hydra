import { set } from '@exodus/basic-utils'
import { isNumberUnit } from '@exodus/currency'
import { cloneDeepWith, isEqual } from 'lodash'
import fiatCurrencies from '@exodus/fiat-currencies'
import { combine } from '@exodus/atoms'
import { getCreateConversion } from '../shared/get-create-conversion.js'

// not super efficient, so we're assuming small objects, like { [walletAccount]: xyz }
const areKeysSame = (a, b) => isEqual(Object.keys(a).sort(), Object.keys(b).sort())

const MODULE_ID = 'fiatBalances'

const cloneBalances = (balances) =>
  cloneDeepWith(balances, (val) => {
    if (isNumberUnit(val)) return val
  })

class FiatBalances {
  #logger
  #assetsModule
  #balanceFields
  #fiatCurrency
  #cachedRates
  #latestAssetBalances = null
  #balances = Object.create(null)
  #fiatBalancesAtom
  #inputAtom
  #balancesAtom
  // #balances.totals: Object,
  // #balances.byWalletAccount: Object,
  // #balances.byAssetSource: Object,
  // #balances.byBaseAssetSource: Object,
  #subscriptions = []

  constructor({
    assetsModule,
    logger,
    balancesAtom,
    config: { balanceFields },
    fiatBalancesAtom,
    ratesAtom,
    currencyAtom,
  }) {
    this.#logger = logger
    this.#assetsModule = assetsModule
    this.#balanceFields = balanceFields
    this.#fiatBalancesAtom = fiatBalancesAtom
    this.#balancesAtom = balancesAtom
    this.#inputAtom = combine({
      rates: ratesAtom,
      currency: currencyAtom,
    })
  }

  load = () => {
    this.#subscriptions.push(
      this.#inputAtom.observe(({ currency, rates }) => {
        this.#fiatCurrency = currency
        this.#cachedRates = rates
        this.#maybeRecompute()
      }),
      this.#balancesAtom.observe(this.#setBalances)
    )
  }

  #isReady = () => {
    return Boolean(
      this.#cachedRates &&
        this.#fiatCurrency &&
        this.#latestAssetBalances &&
        this.#cachedRates[this.#fiatCurrency]
    )
  }

  // seems cheap, worth memoizing?
  #getCreateConversion = ({ assetName }) => {
    const fiatCurrency = fiatCurrencies[this.#fiatCurrency]
    const rates = this.#cachedRates[this.#fiatCurrency]
    const asset = this.#assetsModule.getAsset(assetName)

    return getCreateConversion(fiatCurrency, rates)(asset)
  }

  #convertToFiat = ({ assetName, value }) => {
    return this.#getCreateConversion({ assetName })(value)
  }

  #maybeRecompute = () => {
    if (this.#isReady()) this.#recompute()
  }

  #recompute = async () => {
    this.#reset()

    const balances = this.#latestAssetBalances
    const { byAssetSource, byBaseAssetSource, byWalletAccount, byAsset } = this.#balances
    const fiatZero = fiatCurrencies[this.#fiatCurrency].ZERO

    Object.keys(balances).forEach((walletAccount) => {
      const walletAccountBalances = balances[walletAccount]
      this.#balanceFields.forEach((field) => {
        let fieldTotal = fiatZero
        const entries = Object.entries(walletAccountBalances).filter(([balances]) => balances)

        entries.forEach(([assetName, assetBalances]) => {
          const balance = assetBalances?.[field]
          if (!balance) return

          if (!byAsset?.[assetName]) {
            set(byAsset, [assetName, field], fiatZero)
          }

          if (!byAssetSource?.[walletAccount]?.[assetName]?.[field]) {
            set(byAssetSource, [walletAccount, assetName, field], fiatZero)
          }

          const baseAssetName = this.#assetsModule.getAsset(assetName).baseAsset.name
          if (!byBaseAssetSource?.[walletAccount]?.[baseAssetName]?.[field]) {
            set(byBaseAssetSource, [walletAccount, baseAssetName, field], fiatZero)
          }

          const fiatValue = this.#convertToFiat({ assetName, value: balance })

          byAssetSource[walletAccount][assetName][field] =
            byAssetSource[walletAccount][assetName][field].add(fiatValue)

          byBaseAssetSource[walletAccount][baseAssetName][field] =
            byBaseAssetSource[walletAccount][baseAssetName][field].add(fiatValue)

          byAsset[assetName][field] = byAsset[assetName][field].add(fiatValue)

          fieldTotal = fieldTotal.add(fiatValue)
        })

        set(byWalletAccount, [walletAccount, field], fieldTotal)
      })
    })

    this.#recomputeWalletTotals()
  }

  #setBalances = ({ balances, changes }) => {
    const needsRecompute =
      !this.#balances.byWalletAccount ||
      !changes ||
      // adding/removing walletAccounts is fairly rare, recompute to reduce code complexity
      (this.#latestAssetBalances && !areKeysSame(this.#latestAssetBalances, balances))

    this.#latestAssetBalances = balances
    if (!this.#isReady()) return

    if (needsRecompute) return this.#recompute()

    this.#logger.log('recomputing based on new balances')

    const fiatZero = fiatCurrencies[this.#fiatCurrency].ZERO

    // TODO set changes to fiatBalancesAtom as well
    const { byWalletAccount, byAssetSource, byBaseAssetSource, byAsset } = this.#balances
    let needsFlush = false
    Object.entries(changes).forEach(([walletAccount, walletAccountBalancesChanges]) => {
      const walletAccountBalances = byWalletAccount[walletAccount]
      Object.entries(walletAccountBalancesChanges).forEach(
        ([assetName, assetSourceBalancesChanges]) => {
          const baseAssetName = this.#assetsModule.getAsset(assetName).baseAsset.name
          this.#balanceFields.forEach((field) => {
            // we may not be interested in all fields from `balances`
            if (!assetSourceBalancesChanges[field]) return

            const { from, to } = assetSourceBalancesChanges[field]
            walletAccountBalances[field] = walletAccountBalances[field] || fiatZero

            const fromFiatValue = this.#convertToFiat({ assetName, value: from })
            const toFiatValue = this.#convertToFiat({ assetName, value: to })

            if (fromFiatValue.equals(toFiatValue)) return
            needsFlush = true
            walletAccountBalances[field] = walletAccountBalances[field]
              .sub(fromFiatValue)
              .add(toFiatValue)

            if (!byAsset[assetName]?.[field]) {
              set(byAsset, [assetName, field], fiatZero)
            }

            byAsset[assetName][field] = byAsset[assetName][field]
              .sub(fromFiatValue)
              .add(toFiatValue)
            //
            ;[
              {
                byAssetSource,
                assetName,
              },
              {
                byAssetSource: byBaseAssetSource,
                assetName: baseAssetName,
              },
            ].forEach(({ byAssetSource, assetName }) => {
              if (!byAssetSource[walletAccount]?.[assetName]?.[field]) {
                set(byAssetSource, [walletAccount, assetName, field], fiatZero)
              }

              // eslint-disable-next-line @exodus/mutable/no-param-reassign-prop-only
              byAssetSource[walletAccount][assetName][field] = byAssetSource[walletAccount][
                assetName
              ][field]
                .sub(fromFiatValue)
                .add(toFiatValue)
            })
          })
        }
      )
    })

    if (!needsFlush) return

    this.#recomputeWalletTotals()
  }

  #recomputeWalletTotals = () => {
    this.#balanceFields.forEach((field) => {
      this.#balances.totals[field] = Object.entries(this.#balances.byWalletAccount).reduce(
        (total, [walletAccount, walletAccountBalances]) =>
          walletAccountBalances[field] ? total.add(walletAccountBalances[field]) : total,
        fiatCurrencies[this.#fiatCurrency].ZERO
      )
    })

    this.#flush()
  }

  #reset = () => {
    const totals = Object.create(null)
    const byWalletAccount = Object.create(null)
    const byAssetSource = Object.create(null)
    const byBaseAssetSource = Object.create(null)
    const byAsset = Object.create(null)
    this.#balances = Object.assign(Object.create(null), {
      totals,
      byWalletAccount,
      byAssetSource,
      byBaseAssetSource,
      byAsset,
    })
  }

  #flush = () => {
    this.#logger.log('fiat balances updated')
    const data = cloneBalances({ balances: this.#balances })
    this.#fiatBalancesAtom.set((current) => (isEqual(current, data) ? current : data))
  }

  stop = () => {
    this.#subscriptions.forEach((unsubscribe) => unsubscribe())
    this.#subscriptions = []
  }
}

const createFiatBalances = (...args) => new FiatBalances(...args)

const fiatBalancesDefinition = {
  id: MODULE_ID,
  type: 'module',
  factory: createFiatBalances,
  dependencies: [
    'assetsModule',
    'logger',
    'balancesAtom',
    'fiatBalancesAtom',
    'config',
    'ratesAtom',
    'currencyAtom',
  ],
  public: true,
}

export default fiatBalancesDefinition
