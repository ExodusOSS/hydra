import { set } from '@exodus/basic-utils'
import fiatCurrencies from '@exodus/fiat-currencies'
import { combine } from '@exodus/atoms'

const areKeysSame = (a, b) => {
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  if (keysA.length !== keysB.length) return false
  const aKeySet = new Set(keysA)
  return keysB.every((key) => aKeySet.has(key))
}

const shallowClone = (obj) => ({ ...obj })

const clone2Levels = (obj) => {
  const result = Object.create(null)
  for (const key of Object.keys(obj)) {
    result[key] = { ...obj[key] }
  }

  return result
}

const clone3Levels = (obj) => {
  const result = Object.create(null)
  for (const key1 of Object.keys(obj)) {
    const level1 = obj[key1]
    const clonedLevel1 = Object.create(null)
    for (const key2 of Object.keys(level1)) {
      clonedLevel1[key2] = { ...level1[key2] }
    }

    result[key1] = clonedLevel1
  }

  return result
}

export const cloneBalances = (wrapper) => {
  const balances = wrapper.balances
  return {
    balances: {
      totals: shallowClone(balances.totals),
      byWalletAccount: clone2Levels(balances.byWalletAccount),
      byAssetSource: clone3Levels(balances.byAssetSource),
      byBaseAssetSource: clone3Levels(balances.byBaseAssetSource),
      byAsset: clone2Levels(balances.byAsset),
    },
  }
}

class FiatBalances {
  #logger
  #assetsAtom
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
    assetsAtom,
    logger,
    balancesAtom,
    config: { balanceFields },
    fiatBalancesAtom,
    ratesAtom,
    currencyAtom,
  }) {
    this.#logger = logger
    this.#assetsAtom = assetsAtom
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
    const rates = this.#cachedRates?.[this.#fiatCurrency]
    if (!this.#cachedRates || !this.#fiatCurrency || !this.#latestAssetBalances || !rates) {
      return false
    }

    for (const ticker in rates) {
      if (!rates[ticker]?.invalid) return true
    }

    return false
  }

  #convertToFiat = ({ asset, value }) => {
    const fiatCurrency = fiatCurrencies[this.#fiatCurrency]
    if (value.isZero) return fiatCurrency.ZERO
    const rates = this.#cachedRates?.[this.#fiatCurrency]
    const ticker = asset.ticker
    // HACK: Super hacky, terrible, the rates state object should have the prices split up by sub-objects per fiat
    const fiatRate =
      fiatCurrency.defaultUnit.unitName === 'USD'
        ? rates?.[ticker]?.priceUSD || 0
        : rates?.[ticker]?.price || 0

    if (fiatRate === 0) return fiatCurrency.ZERO

    return fiatCurrency.defaultUnit(value.mul(fiatRate).toDefaultNumber())
  }

  #maybeRecompute = () => {
    if (this.#isReady()) void this.#recompute()
  }

  #recompute = async () => {
    this.#reset()

    const { value: assets } = await this.#assetsAtom.get()
    const balances = this.#latestAssetBalances
    const { byAssetSource, byBaseAssetSource, byWalletAccount, byAsset } = this.#balances
    const fiatZero = fiatCurrencies[this.#fiatCurrency].ZERO

    for (const walletAccount in balances) {
      const walletAccountBalances = balances[walletAccount]
      const walletTotals = Object.create(null)
      for (const field of this.#balanceFields) walletTotals[field] = fiatZero

      let byWalletAccountRef = byWalletAccount[walletAccount]
      if (!byWalletAccountRef) {
        byWalletAccountRef = Object.create(null)
        byWalletAccount[walletAccount] = byWalletAccountRef
      }

      let byAssetSourceWalletRef = byAssetSource[walletAccount]
      if (!byAssetSourceWalletRef) {
        byAssetSourceWalletRef = Object.create(null)
        byAssetSource[walletAccount] = byAssetSourceWalletRef
      }

      let byBaseAssetSourceWalletRef = byBaseAssetSource[walletAccount]
      if (!byBaseAssetSourceWalletRef) {
        byBaseAssetSourceWalletRef = Object.create(null)
        byBaseAssetSource[walletAccount] = byBaseAssetSourceWalletRef
      }

      for (const assetName in walletAccountBalances) {
        const assetBalances = walletAccountBalances[assetName]
        if (!assetBalances) continue
        const asset = assets[assetName]
        const baseAssetName = asset.baseAsset.name

        let byAssetSourceAssetRef = byAssetSourceWalletRef[assetName]
        if (!byAssetSourceAssetRef) {
          byAssetSourceAssetRef = Object.create(null)
          byAssetSourceWalletRef[assetName] = byAssetSourceAssetRef
        }

        let byBaseAssetSourceAssetRef = byBaseAssetSourceWalletRef[baseAssetName]
        if (!byBaseAssetSourceAssetRef) {
          byBaseAssetSourceAssetRef = Object.create(null)
          byBaseAssetSourceWalletRef[baseAssetName] = byBaseAssetSourceAssetRef
        }

        let byAssetRef = byAsset[assetName]
        if (!byAssetRef) {
          byAssetRef = Object.create(null)
          byAsset[assetName] = byAssetRef
        }

        for (const field of this.#balanceFields) {
          const balance = assetBalances[field]
          if (!balance) continue

          const fiatValue = this.#convertToFiat({ value: balance, asset })

          byAssetSourceAssetRef[field] = (byAssetSourceAssetRef[field] || fiatZero).add(fiatValue)
          byBaseAssetSourceAssetRef[field] = (byBaseAssetSourceAssetRef[field] || fiatZero).add(
            fiatValue
          )
          byAssetRef[field] = (byAssetRef[field] || fiatZero).add(fiatValue)
          walletTotals[field] = walletTotals[field].add(fiatValue)
        }
      }

      for (const field of this.#balanceFields) {
        byWalletAccountRef[field] = walletTotals[field]
      }
    }

    this.#recomputeWalletTotals()
  }

  #setBalances = async ({ balances, changes }) => {
    const needsRecompute =
      !this.#balances.byWalletAccount ||
      !changes ||
      // adding/removing walletAccounts is fairly rare, recompute to reduce code complexity
      (this.#latestAssetBalances && !areKeysSame(this.#latestAssetBalances, balances))

    this.#latestAssetBalances = balances
    if (!this.#isReady()) return

    if (needsRecompute) return this.#recompute()

    this.#logger.log('recomputing based on new balances')

    const { value: assets } = await this.#assetsAtom.get()
    const fiatZero = fiatCurrencies[this.#fiatCurrency].ZERO

    // TODO set changes to fiatBalancesAtom as well
    const { byWalletAccount, byAssetSource, byBaseAssetSource, byAsset } = this.#balances
    let needsFlush = false
    Object.entries(changes).forEach(([walletAccount, walletAccountBalancesChanges]) => {
      const walletAccountBalances = byWalletAccount[walletAccount]
      Object.entries(walletAccountBalancesChanges).forEach(
        ([assetName, assetSourceBalancesChanges]) => {
          const asset = assets[assetName]
          const baseAssetName = asset.baseAsset.name
          this.#balanceFields.forEach((field) => {
            // we may not be interested in all fields from `balances`
            if (!assetSourceBalancesChanges[field]) return

            const { from, to } = assetSourceBalancesChanges[field]
            walletAccountBalances[field] = walletAccountBalances[field] || fiatZero

            const fromFiatValue = this.#convertToFiat({ value: from, asset })
            const toFiatValue = this.#convertToFiat({ value: to, asset })

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

              // oxlint-disable-next-line @exodus/oxlint-plugin-hydra/no-param-reassign-prop-only
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
    this.#fiatBalancesAtom.set(cloneBalances({ balances: this.#balances }))
  }

  stop = () => {
    this.#subscriptions.forEach((unsubscribe) => unsubscribe())
    this.#subscriptions = []
  }
}

const createFiatBalances = (...args) => new FiatBalances(...args)

const fiatBalancesDefinition = {
  id: 'fiatBalances',
  type: 'module',
  factory: createFiatBalances,
  dependencies: [
    'assetsAtom',
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
