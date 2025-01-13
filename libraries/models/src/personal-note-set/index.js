// adapted from OrderSet

// the personal-note and personal-note-set models do something slightly differently than the others. update/add returns the same instance if the data did not change.
// previously the consumer would need to do this to avoid unnecessary re-renders, but we have seen issues caused by it misuse

import { ModelIdSymbol } from '../constants.js'
import PersonalNote from '../personal-note/index.js'

class PersonalNoteSet {
  constructor(notes) {
    this._items = new Map() // <txId, PersonalNote>
    if (notes) {
      for (const item of notes) {
        const note = coerceToPersonalNote(item)
        this._items.set(String(note), note)
      }
    }
  }

  static fromArray(arr) {
    return arr == null ? PersonalNoteSet.EMPTY : new PersonalNoteSet(arr)
  }

  static get [ModelIdSymbol]() {
    return 'PersonalNoteSet'
  }

  static isInstance(instance) {
    return instance?.constructor?.[ModelIdSymbol] === this[ModelIdSymbol]
  }

  // overwrites existing
  add(notes) {
    // coerce to array
    notes = coerceToArray(notes)
    if (notes.length === 0) return this

    const candidates = PersonalNoteSet.fromArray(notes)
    const replaced = new Set()
    const toAdd = []
    ;[...candidates].forEach((candidate) => {
      const conflict = this.get(candidate)
      if (!conflict) {
        toAdd.push(candidate)
        return
      }

      if (!conflict.equals(candidate)) {
        // prefer incoming note
        toAdd.push(candidate)
        replaced.add(conflict)
      }
    })

    if (toAdd.length === 0) return this

    const finalCopy = [...[...this].filter((note) => !replaced.has(note)), ...toAdd]

    return PersonalNoteSet.fromArray(finalCopy)
  }

  clone() {
    return PersonalNoteSet.fromArray([...this])
  }

  // key id comparison only
  equals(otherSet) {
    if (this === otherSet) return true
    if (this.size !== otherSet.size) return false

    return [...this].every((note) => {
      const candidate = otherSet.get(note)
      return candidate && candidate.equals(note)
    })
  }

  get(item) {
    const txId = typeof item === 'string' ? item : item.txId
    if (!txId) {
      throw new Error('expected txId or Object/PersonalNote with property txId')
    }

    return this._items.get(txId)
  }

  has(item) {
    return this._items.has(String(item))
  }

  toJSON() {
    return [...this].map((item) => item.toJSON())
  }

  // adds and/or updates notes
  update(items) {
    const updated = items.map((item) => {
      const existingItem = this.get(item)
      return existingItem ? existingItem.update(item) : coerceToPersonalNote(item)
    })

    // overwrite with updated items
    return this.add(updated)
  }

  [Symbol.iterator]() {
    return this._items.values()
  }

  get size() {
    return this._items.size
  }
}

PersonalNoteSet.EMPTY = new PersonalNoteSet()

const coerceToPersonalNote = (obj) =>
  obj instanceof PersonalNote ? obj : PersonalNote.fromJSON(obj)

const coerceToArray = (obj) => (Array.isArray(obj) ? obj : [obj].flat())

export default PersonalNoteSet
