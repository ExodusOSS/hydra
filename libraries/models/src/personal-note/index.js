// On first glance, it might feel like personal-notes should be part of the tx model
// info here on why they were separated out https://github.com/ExodusMovement/exodus-core/issues/150
// general gist, it is far easier to e2e sync them as a separate model than if they were part of the tx

import assert from 'minimalistic-assert'
import lodash from 'lodash'
import { ModelIdSymbol } from '../constants.js'

const { isEqual, set } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

// NOTE: should treat as immutable

const coerceToObject = (obj) => (obj instanceof PersonalNote ? obj.toJSON() : obj)

const cleanUpNoteJSON = ({ personalNote, to }) => {
  delete personalNote.message // eslint-disable-line @exodus/mutable/no-param-reassign-prop-only

  if (personalNote.sends) {
    // check if there's an existing message for a mixed case address, and delete it
    Object.keys(personalNote.sends || {}).forEach((address) => {
      const lower = address.toLowerCase()
      if (address !== lower && lower === to) {
        set(personalNote, ['sends', address, 'message'], null)
      }
    })
  }
}

export default class PersonalNote {
  constructor(props = {}) {
    assert(typeof props.txId === 'string', `expected "txId", received: ${props.txId}`)

    Object.assign(this, props)
    this.txId = props.txId
    // notes are used for other use cases like monero send tx, dapp data so a string message isn't always included
    this.message = props.message || ''
  }

  static get [ModelIdSymbol]() {
    return 'PersonalNote'
  }

  static isInstance(instance) {
    return instance?.constructor?.[ModelIdSymbol] === this[ModelIdSymbol]
  }

  static fromJSON(json) {
    if (typeof json === 'string') json = JSON.parse(json)

    return new PersonalNote(json)
  }

  toJSON() {
    const obj = { ...this }
    if (this.sends) {
      obj.sends = {}
      for (const [key, value] of Object.entries(this.sends)) {
        obj.sends[key] = { ...value }
      }
    }

    return obj
  }

  toString() {
    return String(this.txId)
  }

  equals(note) {
    if (!note) {
      return false
    }

    return this === note || isEqual(this.toJSON(), note.toJSON())
  }

  update(fields) {
    fields = coerceToObject(fields)
    if (fields.txId && fields.txId !== this.txId) {
      throw new Error('"txId" cannot be changed once it is set')
    }

    const current = this.toJSON()
    const isNoop = Object.keys(fields).every((field) => isEqual(current[field], fields[field]))
    if (isNoop) {
      return this
    }

    return PersonalNote.fromJSON({ ...current, ...fields })
  }

  getMessage({ to } = {}) {
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

  setMessage({ to, message }) {
    assert(typeof message === 'string', 'expected string "message"')
    if (!to) return this.update({ message })

    const json = this.toJSON()
    cleanUpNoteJSON({ personalNote: json, to })
    const update = set(json, ['sends', to, 'message'], message)
    return this.update(update)
  }
}
