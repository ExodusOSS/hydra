import lodash from 'lodash'
import defaultConfig from '../../default-config.js'

const { memoize } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

const { balanceFields } = defaultConfig

const resultFunction = (getBalances) =>
  memoize(
    ({ assetName, walletAccount, field }) => {
      if (!balanceFields.includes(field)) {
        throw new Error(
          `Value '${field}' is not one of the valid fields '${balanceFields.join(', ')}'`
        )
      }

      return getBalances({ assetName, walletAccount })?.[field]
    },
    ({ assetName, walletAccount, field }) => [assetName, walletAccount, field].join('-')
  )

const getBalanceForFieldSelectorDefinition = {
  id: 'getBalanceForField',
  resultFunction,
  dependencies: [{ module: 'balances', selector: 'getBalances' }],
}

export default getBalanceForFieldSelectorDefinition
