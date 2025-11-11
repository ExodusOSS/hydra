// On first glance, it might feel like personal-notes should be part of the tx model
// info here on why they were separated out https://github.com/ExodusMovement/exodus-core/issues/150
// general gist, it is far easier to e2e sync them as a separate model than if they were part of the tx

import assert from 'minimalistic-assert'
// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import { ModelIdSymbol } from '../constants.js'
import { createIsInstance, omitUndefined } from '../utils.js'

const { isEqual, set } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

// NOTE: should treat as immutable

const coerceToObject = (obj: PersonalNote | object) =>
  obj instanceof PersonalNote ? obj.toJSON() : obj

const cleanUpNoteJSON = ({ personalNote, to }: { personalNote: PersonalNoteJson; to: string }) => {
  delete personalNote.message // eslint-disable-line @exodus/mutable/no-param-reassign-prop-only

  if (personalNote.sends) {
    // check if there's an existing message for a mixed case address, and delete it
    Object.keys(personalNote.sends || Object.create(null)).forEach((address) => {
      const lower = address.toLowerCase()
      if (address !== lower && lower === to) {
        set(personalNote, ['sends', address, 'message'], null)
      }
    })
  }
}

export type PersonalNoteProps = {
  txId: string
  message?: string
  [customProp: string]: any
}

export type PersonalNoteJson = PersonalNoteProps & {
  sends?: Record<string, { message: string }>
}

export default class PersonalNote implements PersonalNoteProps {
  txId: string
  message: string
  sends?: Record<string, { message: string }>

  constructor(props: Partial<PersonalNoteProps> = Object.create(null)) {
    assert(typeof props.txId === 'string', `expected "txId", received: ${props.txId}`)

    Object.assign(this, props)
    this.txId = props.txId
    // notes are used for other use cases like monero send tx, dapp data so a string message isn't always included
    this.message = props.message || ''
  }

  static get [ModelIdSymbol]() {
    return 'PersonalNote'
  }

  // can't assign directly to [Symbol.hasInstance] due to a babel bug
  // can't use this in static initializers due to another babel bug
  static _isInstance = createIsInstance(PersonalNote)
  static [Symbol.hasInstance](x: any) {
    return this._isInstance(x)
  }

  /**
   * @deprecated Use `instanceof` instead.
   */
  static isInstance = PersonalNote[Symbol.hasInstance]

  static fromJSON(json: string | PersonalNoteProps) {
    return new PersonalNote(typeof json === 'string' ? JSON.parse(json) : json)
  }

  toJSON(): PersonalNoteJson {
    const obj = { ...this }
    if (this.sends) {
      obj.sends = Object.create(null)
      for (const [key, value] of Object.entries(this.sends)) {
        obj.sends![key] = { ...value }
      }
    }

    return omitUndefined(obj)
  }

  toRedactedJSON() {
    return {
      txId: this.txId,
    }
  }

  toString() {
    return String(this.txId)
  }

  equals(note: PersonalNote) {
    if (!note) {
      return false
    }

    return this === note || isEqual(this.toJSON(), note.toJSON())
  }

  update(fields: Partial<PersonalNoteProps> | PersonalNote) {
    const object = coerceToObject(fields) as Partial<PersonalNoteProps> | PersonalNoteJson
    if (object.txId && object.txId !== this.txId) {
      throw new Error('"txId" cannot be changed once it is set')
    }

    const current = this.toJSON()
    const isNoop = Object.keys(object).every((field) => isEqual(current[field], object[field]))
    if (isNoop) {
      return this
    }

    return PersonalNote.fromJSON({ ...current, ...object })
  }

  getMessage({ to }: { to?: string } = Object.create(null)) {
    if (to && this.sends) {
      const sends = Object.entries(this.sends)
      for (const [address, { message }] of sends) {
        if (address.toLowerCase() === to.toLowerCase() && message) {
          return message
        }
      }
    }

    return this.message || ''
  }

  setMessage({ to, message }: { to?: string; message: string }) {
    assert(typeof message === 'string', 'expected string "message"')
    if (!to) return this.update({ message })

    const json = this.toJSON()
    cleanUpNoteJSON({ personalNote: json, to })
    const update = set(json, ['sends', to, 'message'], message)
    return this.update(update)
  }
}
