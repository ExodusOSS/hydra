// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import { createSelector } from 'reselect'
import {
  capitalize,
  handleLongAccountName,
  handleAccountsWithSameLabels,
} from './get-proper-name.js'

const { memoize } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

const createProperNameSelectorFactory = (walletAccountsSelector, getMemoizedSelector) =>
  memoize(
    (walletAccountName, { maxLength } = {}) =>
      createSelector(
        walletAccountsSelector,
        getMemoizedSelector(walletAccountName),
        (walletAccounts, walletAccount) => {
          if (!walletAccounts[walletAccountName]) return null

          const { source, label, id } = walletAccount

          let displayLabel = label || capitalize(source)

          displayLabel = handleLongAccountName({
            displayLabel,
            maxLength,
          })

          if (source !== 'exodus') {
            displayLabel = handleAccountsWithSameLabels({
              label,
              displayLabel,
              id,
              source,
              allWalletAccountObjects: Object.values(walletAccounts),
            })
          }

          return displayLabel
        }
      ),
    (...args) => JSON.stringify(args)
  )

const createProperNameSelectorDefinition = {
  id: 'createProperNameSelector',
  selectorFactory: createProperNameSelectorFactory,
  dependencies: [
    //
    { selector: 'data' },
    { selector: 'getMemoized' },
  ],
}

export default createProperNameSelectorDefinition
