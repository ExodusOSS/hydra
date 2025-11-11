import proxyFreeze from 'proxy-freeze'
// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import assert from 'minimalistic-assert'
import { ModelIdSymbol } from '../constants.js'
import { createIsInstance, omitUndefined } from '../utils.js'

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
export const PASSKEY_SRC = 'passkey'

export type WalletAccountSource =
  | typeof EXODUS_SRC
  | typeof SEED_SRC
  | typeof TREZOR_SRC
  | typeof LEDGER_SRC
  | typeof FTX_SRC
  | typeof PASSKEY_SRC

export const CUSTODIAL_SOURCES: WalletAccountSource[] = [FTX_SRC]
export const HARDWARE_SOURCES: WalletAccountSource[] = [TREZOR_SRC, LEDGER_SRC]
export const SOFTWARE_SEED_SOURCES: WalletAccountSource[] = [EXODUS_SRC, SEED_SRC, PASSKEY_SRC]

export const DEFAULT_COLORS = Object.freeze({
  exodus: '#7b39ff',
  seed: '#7b39ff',
  trezor: '#30d968',
  ledger: '#ffffff',
  ftx: '#00b4c2',
  passkey: '#7b39ff',
})

export const DEFAULT_ICONS = Object.freeze({
  exodus: 'exodus',
  seed: 'exodus',
  trezor: 'trezor',
  ledger: 'ledger',
  ftx: 'ftx',
  passkey: 'exodus',
})

export const LABEL_MAX_LENGTH = 100

const capFirst = (str: string) => str[0]!.toUpperCase() + str.slice(1)

export const getDefaultLabel = ({
  source,
  index,
}: {
  source: WalletAccountSource
  index?: number | null
}) => (index === 0 ? capFirst(source) : '')

const isColor = (str: unknown) => typeof str === 'string' && /^#[\dA-Fa-f]{3,6}$/u.test(str)

const IMMUTABLE_PROPERTIES = ['id', 'source', 'index', 'isMultisig', 'delegated']

export type WalletAccountParams = {
  source: WalletAccountSource
  index?: number | null
  id?: string | number
  label?: string
  model?: string
  lastConnected?: number
  is2FA?: boolean
  color?: string
  icon?: string
  enabled?: boolean
  seedId?: string
  compatibilityMode?: string
  isMultisig?: boolean
  delegated?: boolean
}

export default class WalletAccount {
  static readonly LABEL_MAX_LENGTH = LABEL_MAX_LENGTH
  static readonly DEFAULT_COLORS = DEFAULT_COLORS
  static readonly DEFAULT_ICONS = DEFAULT_ICONS
  static readonly EXODUS_SRC = EXODUS_SRC
  static readonly SEED_SRC = SEED_SRC
  static readonly TREZOR_SRC = TREZOR_SRC
  static readonly LEDGER_SRC = LEDGER_SRC
  static readonly FTX_SRC = FTX_SRC
  static readonly PASSKEY_SRC = PASSKEY_SRC

  source: WalletAccountSource
  index: number | null
  id?: string | number
  label: string
  model?: string
  lastConnected?: number
  is2FA?: boolean
  color?: string
  icon?: string
  enabled: boolean
  seedId?: string
  compatibilityMode?: string
  isMultisig?: boolean
  delegated?: boolean

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
    delegated,
  }: WalletAccountParams) {
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
    assert(source !== PASSKEY_SRC || seedId, 'expected option "seedId" for passkey wallet account')
    assert(
      delegated === undefined || typeof delegated === 'boolean',
      'if option "delegated" is provided it must be a boolean'
    )

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
    this.delegated = delegated
    return proxyFreeze(this)
  }

  static get [ModelIdSymbol]() {
    return 'WalletAccount'
  }

  // can't assign directly to [Symbol.hasInstance] due to a babel bug
  // can't use this in static initializers due to another babel bug
  static _isInstance = createIsInstance(WalletAccount)
  static [Symbol.hasInstance](x: any) {
    return this._isInstance(x)
  }

  /**
   * @deprecated Use `instanceof` instead.
   */
  static isInstance = WalletAccount[Symbol.hasInstance]

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
    return {
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
      delegated: this.delegated,
      ...(this.id != null && { id: this.id }),
    }
  }

  toRedactedJSON() {
    return omitUndefined({
      source: this.source,
      index: this.index,
      model: this.model,
      lastConnected: this.lastConnected,
      is2FA: this.is2FA,
      enabled: this.enabled,
      compatibilityMode: this.compatibilityMode,
      seedId: this.seedId,
      isMultisig: this.isMultisig,
      delegated: this.delegated,
      color: this.color,
      icon: this.icon,
    })
  }

  equals(otherWalletAccount: WalletAccount) {
    return this === otherWalletAccount || isEqual(this.toJSON(), otherWalletAccount.toJSON())
  }

  update(data: Partial<WalletAccount | WalletAccountParams>) {
    const fields: Record<string, any> = data instanceof WalletAccount ? data.toJSON() : data
    const current: Record<string, any> = this.toJSON()

    const isNoop = Object.keys(fields).every((field) => isEqual(current[field], fields[field]))
    if (isNoop) {
      return this
    }

    IMMUTABLE_PROPERTIES.forEach((immutable) => {
      if (fields[immutable] && fields[immutable] !== this[immutable as keyof WalletAccount]) {
        throw new Error(`property "${immutable}" is immutable`)
      }
    })

    return new WalletAccount(merge(Object.create(null), current, fields) as WalletAccountParams)
  }

  get isSoftware() {
    return SOFTWARE_SEED_SOURCES.includes(this.source)
  }

  get isHardware() {
    return HARDWARE_SOURCES.includes(this.source)
  }

  get isCustodial() {
    return CUSTODIAL_SOURCES.includes(this.source)
  }

  get isPasskey() {
    return this.source === PASSKEY_SRC
  }

  static get DEFAULT_NAME() {
    return WalletAccount.DEFAULT.toString()
  }

  static get DEFAULT() {
    return new WalletAccount({
      source: EXODUS_SRC,
      index: 0,
    })
  }

  static get VALID_SOURCES() {
    return [...HARDWARE_SOURCES, ...CUSTODIAL_SOURCES, ...SOFTWARE_SEED_SOURCES]
  }

  static defaultWith(params: Partial<WalletAccountParams>) {
    return new WalletAccount({ ...WalletAccount.DEFAULT, ...params })
  }
}
