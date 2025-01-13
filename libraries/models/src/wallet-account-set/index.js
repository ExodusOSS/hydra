import lodash from 'lodash'
import WalletAccount from '../wallet-account/index.js'
import { ModelIdSymbol } from '../constants.js'

const { mapValues, mergeWith } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

/**
 * @param {WalletAccount | object} walletAccount input to be coerced to wallet account
 * @returns {WalletAccount} input as is if it is of instance WalletAccount, otherwise creates a new instance from input
 */
const coerceToWalletAccount = (walletAccount) =>
  walletAccount instanceof WalletAccount ? walletAccount : new WalletAccount(walletAccount)

class WalletAccountSet {
  constructor(byName = {}) {
    this._byName = mapValues(byName, coerceToWalletAccount)
  }

  static get [ModelIdSymbol]() {
    return 'WalletAccountSet'
  }

  static isInstance(instance) {
    return instance?.constructor?.[ModelIdSymbol] === this[ModelIdSymbol]
  }

  toJSON() {
    return mapValues(this._byName, (walletAccount) => walletAccount.toJSON())
  }

  /**
   * @param {string | WalletAccount} name of the wallet account to get
   * @returns {WalletAccount | void} the wallet account instance if present
   */
  get(name) {
    if (name instanceof WalletAccount) name = name.toString()

    if (this._byName.hasOwnProperty(name)) {
      return this._byName[name]
    }
  }

  names() {
    return Object.keys(this._byName)
  }

  /**
   * @param {WalletAccountSet | object} walletAccountsByName data to update in the set
   * @returns {WalletAccountSet} a new instance with the updated data
   */
  update(walletAccountsByName) {
    if (walletAccountsByName instanceof WalletAccountSet) {
      walletAccountsByName = walletAccountsByName.toJSON()
    }

    const updatedByName = mergeWith(
      { ...this._byName },
      walletAccountsByName,
      (existing, updated) => (existing ? existing.update(updated) : coerceToWalletAccount(updated))
    )

    return new WalletAccountSet(updatedByName)
  }

  /**
   * @param {WalletAccountSet} walletAccountsByName wallet account set to compare against
   * @returns {boolean} true if the sets are identical
   */
  equals(walletAccountsByName) {
    if (this === walletAccountsByName) return true

    const keys = Object.keys(walletAccountsByName.toJSON()).sort()
    const myKeys = this.names().sort()
    if (keys.length !== myKeys.length) return false

    return myKeys.every((name) => {
      const myWalletAccount = this.get(name)
      const otherWalletAccount = walletAccountsByName.get(name)
      return otherWalletAccount && myWalletAccount.equals(otherWalletAccount)
    })
  }
}

WalletAccountSet.EMPTY = new WalletAccountSet()

export default WalletAccountSet
