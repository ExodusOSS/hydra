// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import defaultConfig from '../../default-config.js'

const { memoize } = lodash // oxlint-disable-line @exodus/oxlint-plugin-restricted-imports/prefer-basic-utils

const { balanceFields } = defaultConfig

const resultFunction = (getAsset, getBalances) =>
  memoize(
    ({ assetName, walletAccount, field }) => {
      if (!balanceFields.includes(field)) {
        throw new Error(
          `Value '${field}' is not one of the valid fields '${balanceFields.join(', ')}'`
        )
      }

      return (
        getBalances({ assetName, walletAccount })?.[field] ?? getAsset(assetName)?.currency.ZERO
      )
    },
    ({ assetName, walletAccount, field }) => [assetName, walletAccount, field].join('-')
  )

const getBalanceForFieldSelectorDefinition = {
  id: 'getBalanceForField',
  resultFunction,
  dependencies: [
    { module: 'assets', selector: 'getAsset' },
    { module: 'balances', selector: 'getBalances' },
  ],
}

export default getBalanceForFieldSelectorDefinition
