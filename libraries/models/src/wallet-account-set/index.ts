// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import type { WalletAccountParams } from '../wallet-account/index.js'
import WalletAccount from '../wallet-account/index.js'
import { ModelIdSymbol } from '../constants.js'
import { createIsInstance } from '../utils.js'

const { mapValues, mergeWith } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

const coerceToWalletAccount = (
  walletAccount: WalletAccount | ConstructorParameters<typeof WalletAccount>[0]
) => (walletAccount instanceof WalletAccount ? walletAccount : new WalletAccount(walletAccount))

class WalletAccountSet {
  private readonly _byName: Record<string, WalletAccount>

  constructor(byName = {}) {
    this._byName = mapValues(byName, coerceToWalletAccount)
  }

  static get [ModelIdSymbol]() {
    return 'WalletAccountSet'
  }

  // can't assign directly to [Symbol.hasInstance] due to a babel bug
  // can't use this in static initializers due to another babel bug
  static _isInstance = createIsInstance(WalletAccountSet)
  static [Symbol.hasInstance](x: any) {
    return this._isInstance(x)
  }

  /**
   * @deprecated Use `instanceof` instead.
   */
  static isInstance = WalletAccountSet[Symbol.hasInstance]

  static readonly EMPTY = new WalletAccountSet()

  toJSON() {
    return mapValues(this._byName, (walletAccount) => walletAccount.toJSON())
  }

  toRedactedJSON() {
    return mapValues(this._byName, (walletAccount) => walletAccount.toRedactedJSON())
  }

  get(name: string | WalletAccount) {
    if (name instanceof WalletAccount) name = name.toString()

    if (this._byName.hasOwnProperty(name)) {
      return this._byName[name]
    }
  }

  names() {
    return Object.keys(this._byName)
  }

  update(
    walletAccountsByName:
      | WalletAccountSet
      | { [name: string]: WalletAccount | Partial<WalletAccountParams> }
  ) {
    const byName =
      walletAccountsByName instanceof WalletAccountSet
        ? walletAccountsByName.toJSON()
        : walletAccountsByName

    const updatedByName = mergeWith({ ...this._byName }, byName, (existing, updated) =>
      existing ? existing.update(updated) : coerceToWalletAccount(updated)
    )

    return new WalletAccountSet(updatedByName)
  }

  equals(walletAccountsByName: WalletAccountSet) {
    if (this === walletAccountsByName) return true

    const keys = Object.keys(walletAccountsByName.toJSON()).sort() // eslint-disable-line sonarjs/no-alphabetical-sort
    const myKeys = this.names().sort() // eslint-disable-line sonarjs/no-alphabetical-sort
    if (keys.length !== myKeys.length) return false

    return myKeys.every((name) => {
      const myWalletAccount = this.get(name)!
      const otherWalletAccount = walletAccountsByName.get(name)
      return otherWalletAccount && myWalletAccount.equals(otherWalletAccount)
    })
  }
}

export default WalletAccountSet
