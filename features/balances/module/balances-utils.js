import { mapValues } from '@exodus/basic-utils'

function resolveFieldBalance({ balances, fieldConfig, zero, processedBalances }) {
  if (balances[fieldConfig.name]) {
    return balances[fieldConfig.name]
  }

  if (fieldConfig.legacyName && balances[fieldConfig.legacyName]) {
    return balances[fieldConfig.legacyName]
  }

  if (fieldConfig.default && fieldConfig.default === 'zero') {
    return zero
  }

  if (fieldConfig.default && processedBalances[fieldConfig.default] !== null) {
    if (processedBalances[fieldConfig.default] === undefined) {
      throw new Error(
        `Field config "${fieldConfig.default}" must be defined before "${fieldConfig.name}"`
      )
    }

    return processedBalances[fieldConfig.default]
  }

  return null
}

export const processAssetBalances = ({ balances, zero, balanceFieldsConfig }) => {
  return balanceFieldsConfig.reduce((processedBalances, fieldConfig) => {
    const balance = resolveFieldBalance({
      balances,
      fieldConfig,
      zero,
      processedBalances,
    })
    if (balance !== null) {
      processedBalances[fieldConfig.name] = balance
      if (fieldConfig.legacyName) {
        processedBalances[fieldConfig.legacyName] = balance
      }
    }

    return processedBalances
  }, {})
}

export const validateBalances = ({ balances, asset, logger }) => {
  const assetName = asset.name
  const zero = asset.currency.ZERO

  const log = (error) => {
    logger.warn(error.fn, error.error, error.args)
  }

  return mapValues(balances, (balance, field) => {
    if (!balance) {
      return balance
    }

    if (!balance.unitType.equals(asset.currency)) {
      log({
        fn: 'getAssetBalances',
        error: `asset.api.getBalances ${assetName} returns different ${field} currency`,
        args: {
          balanceUnit: balance.unitType.defaultUnit.unitName,
          assetUnit: asset.currency.defaultUnit.unitName,
        },
      })
      return zero
    }

    if (balance.isNegative) {
      log({
        fn: 'getAssetBalances',
        error: `asset.api.getBalances ${assetName} returns negative ${field}`,
        args: {
          amount: balance.toDefaultString({ unit: true }),
        },
      })
      return zero
    }

    return balance
  })
}
