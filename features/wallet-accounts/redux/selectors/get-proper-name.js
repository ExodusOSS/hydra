import { createSelector } from 'reselect'

/**
 * Returns a function which takes a wallet account name. This
 * function returns a user-friendly version of the wallet account name,
 * leveraging the label in the wallet account's data if one is set.
 */

export const capitalize = (str) => {
  return str[0].toUpperCase() + str.slice(1)
}

export const handleAccountsWithSameLabels = ({
  displayLabel,
  allWalletAccountObjects,
  source,
  label,
  id,
}) => {
  // this also works if label is undefined
  const sameLabelWalletAccounts = allWalletAccountObjects.filter(
    (acct) => acct.source === source && acct.label === label
  )
  const sameLabelIndex = sameLabelWalletAccounts.findIndex((acct) => acct.id === id)

  // If two wallet accounts have the same source and label,
  // we have to visually differentiate them somehow.
  if (sameLabelWalletAccounts.length > 1) {
    return `${displayLabel} ${sameLabelIndex + 1}`
  }

  return displayLabel
}

export const handleLongAccountName = ({ displayLabel, maxLength }) => {
  if (maxLength && displayLabel.length > maxLength) {
    displayLabel = displayLabel.slice(0, maxLength - 1) + '…'
  }

  return displayLabel
}

const getProperNameSelectorFactory = (namesSelector, getSelector) =>
  createSelector(
    namesSelector,
    getSelector,
    (walletAccountNames, getWalletAccount) =>
      (walletAccountName, { maxLength } = {}) => {
        if (!walletAccountNames.includes(walletAccountName)) return null
        const walletAccount = getWalletAccount(walletAccountName)
        const allWalletAccountObjects = walletAccountNames.map(getWalletAccount)

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
            allWalletAccountObjects,
          })
        }

        return displayLabel
      }
  )

const getProperNameSelectorDefinition = {
  id: 'getProperName',
  selectorFactory: getProperNameSelectorFactory,
  dependencies: [
    //
    { selector: 'names' },
    { selector: 'get' },
  ],
}

export default getProperNameSelectorDefinition
