import proxyFreeze from 'proxy-freeze'
import lodash from 'lodash'
import assert from 'minimalistic-assert'
import { ModelIdSymbol } from '../constants.js'

const { isEqual, isNil, merge } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

/* WalletAccount acts as a robust alternative to using strings
 * to identify and differentiate hardware/software wallet account
 * sources and indexes. WalletAccount instances behave as
 * a string for the purposes of keying an object and are meant
 * to be used as keys.
 *
 * the `id` property is an optional identifier used to differentiate
 * accounts of the same index on a hardware wallet, for example, when
 * the user changes BIP39 passphrases. These IDs are
 * not used for accounts where (source === 'exodus')
 *
 * For safety, WalletAccounts are immutable once constructed. if you want to
 * change a property of a walletAccount, you must make a new variable
 */

export const EXODUS_SRC = 'exodus'
export const SEED_SRC = 'seed'
export const TREZOR_SRC = 'trezor'
export const LEDGER_SRC = 'ledger'
export const FTX_SRC = 'ftx'

export const CUSTODIAL_SOURCES = [FTX_SRC]
export const HARDWARE_SOURCES = [TREZOR_SRC, LEDGER_SRC]
export const SOFTWARE_SEED_SOURCES = [EXODUS_SRC, SEED_SRC]

export const DEFAULT_COLORS = Object.freeze({
  exodus: '#7b39ff',
  seed: '#7b39ff',
  trezor: '#30d968',
  ledger: '#f5e400',
  ftx: '#00b4c2',
})

export const DEFAULT_ICONS = Object.freeze({
  exodus: 'exodus',
  seed: 'exodus',
  trezor: 'trezor',
  ledger: 'trezor', // don't have one yet
  ftx: 'ftx',
})

export const LABEL_MAX_LENGTH = 100

const capFirst = (str) => str[0].toUpperCase() + str.slice(1)

export const getDefaultLabel = ({ source, index }) => (index === 0 ? capFirst(source) : '')

const isColor = (str) => typeof str === 'string' && /^#[\dA-Fa-f]{3,6}$/.test(str)

const IMMUTABLE_PROPERTIES = ['id', 'source', 'index', 'isMultisig']

export default class WalletAccount {
  static LABEL_MAX_LENGTH = LABEL_MAX_LENGTH
  static DEFAULT_COLORS = DEFAULT_COLORS
  static DEFAULT_ICONS = DEFAULT_ICONS
  static EXODUS_SRC = EXODUS_SRC
  static SEED_SRC = SEED_SRC
  static TREZOR_SRC = TREZOR_SRC
  static LEDGER_SRC = LEDGER_SRC
  static FTX_SRC = FTX_SRC

  /** @type {string} 'exodus' | 'trezor' | 'ledger' | 'ftx' | 'seed' */
  source
  /** @type {?number} */
  index
  /** @type {?string} */
  id
  /** @type {string} */
  label
  /** @type {?string} */
  model
  /** @type {?number} */
  lastConnected
  /** @type {?boolean} */
  is2FA
  /** @type {?string} */
  color
  /** @type {?string} */
  icon
  /** @type {boolean} */
  enabled
  /** @type {?string} */
  seedId
  /** @type {?string} */
  compatibilityMode
  /** @type {boolean} */
  isMultisig

  constructor({
    source,
    index,
    id,
    label,
    model,
    lastConnected,
    is2FA,
    color,
    icon,
    compatibilityMode,
    seedId,
    enabled = true,
    isMultisig = false,
  }) {
    const isCustodial = CUSTODIAL_SOURCES.includes(source)
    const isSoftware = SOFTWARE_SEED_SOURCES.includes(source)

    assert(source, 'expected "source" for a wallet account')
    assert(!(index == null && !isCustodial), 'expected "index" for a wallet account')
    assert(id || isSoftware, 'expected option "id" for a non-software wallet account')
    assert(!isSoftware || !id, 'unexpected option "id" for a software wallet account')
    assert(
      !(isSoftware && lastConnected),
      'unexpected option "lastConnected" for a software wallet account'
    )
    assert(
      !compatibilityMode || !isCustodial,
      'compatibilityMode can not be provided for custodial wallet accounts'
    )
    assert(!isSoftware || !model, 'unexpected option "model" for a software wallet account')
    assert(source === EXODUS_SRC || !is2FA, 'is2FA: true is only valid for an exodus walletAccount')
    assert(source !== SEED_SRC || seedId, 'expected option "seedId" for seed wallet account')

    color = color || DEFAULT_COLORS[source]
    icon = icon || DEFAULT_ICONS[source]
    label = label || getDefaultLabel({ source, index })

    if (label.length > LABEL_MAX_LENGTH) {
      label = label.slice(0, LABEL_MAX_LENGTH)
    }

    if (!isColor(color)) {
      throw new Error('expected "color" to be a hex string')
    }

    if (typeof icon !== 'string' || icon.length === 0) {
      throw new Error('expected "icon" to be a non-empty string')
    }

    this.source = source
    this.index = isNil(index) ? null : index
    this.id = id
    this.seedId = seedId
    this.label = label || ''
    this.model = model
    this.lastConnected = lastConnected
    this.is2FA = is2FA
    this.color = color
    this.icon = icon
    this.enabled = enabled
    this.compatibilityMode = compatibilityMode ?? (this.isHardware ? this.source : undefined)
    this.isMultisig = isMultisig
    return proxyFreeze(this)
  }

  static get [ModelIdSymbol]() {
    return 'WalletAccount'
  }

  static isInstance(instance) {
    return instance?.constructor?.[ModelIdSymbol] === this[ModelIdSymbol]
  }

  toString() {
    return [
      this.source,
      this.index,
      ...(this.source === SEED_SRC ? [this.seedId, this.compatibilityMode] : [this.id]),
    ]
      .filter((v) => v != null)
      .join('_')
  }

  toJSON() {
    const json = {
      source: this.source,
      index: this.index,
      label: this.label,
      model: this.model,
      lastConnected: this.lastConnected,
      is2FA: this.is2FA,
      color: this.color,
      icon: this.icon,
      enabled: this.enabled,
      compatibilityMode: this.compatibilityMode,
      seedId: this.seedId,
      isMultisig: this.isMultisig,
    }

    if (this.id != null) json.id = this.id

    return json
  }

  /**
   * @param {WalletAccount} otherWalletAccount WalletAccount to compare with
   * @returns {boolean} true if they are identical
   */
  equals(otherWalletAccount) {
    return this === otherWalletAccount || isEqual(this.toJSON(), otherWalletAccount.toJSON())
  }

  /**
   * @param {WalletAccount | object} fields wallet account instance or object with wallet account properties
   * @returns {WalletAccount} a new wallet account instance with the updated properties
   */
  update(fields) {
    if (fields instanceof WalletAccount) fields = fields.toJSON()

    const current = this.toJSON()
    const isNoop = Object.keys(fields).every((field) => isEqual(current[field], fields[field]))
    if (isNoop) {
      return this
    }

    IMMUTABLE_PROPERTIES.forEach((immutable) => {
      if (fields[immutable] && fields[immutable] !== this[immutable]) {
        throw new Error(`property "${immutable}" is immutable`)
      }
    })

    return new WalletAccount(merge({}, current, fields))
  }

  /** @type {boolean} */
  get isSoftware() {
    return SOFTWARE_SEED_SOURCES.includes(this.source)
  }

  /** @type {boolean} */
  get isHardware() {
    return HARDWARE_SOURCES.includes(this.source)
  }

  /** @type {boolean} */
  get isCustodial() {
    return CUSTODIAL_SOURCES.includes(this.source)
  }

  /** @type {string} */
  static get DEFAULT_NAME() {
    return WalletAccount.DEFAULT.toString()
  }

  /** @type {WalletAccount} */
  static get DEFAULT() {
    return new WalletAccount({
      source: EXODUS_SRC,
      index: 0,
    })
  }

  static defaultWith(params) {
    return new WalletAccount({ ...WalletAccount.DEFAULT, ...params })
  }
}
