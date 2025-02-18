// adapted from OrderSet

// the personal-note and personal-note-set models do something slightly differently than the others. update/add returns the same instance if the data did not change.
// previously the consumer would need to do this to avoid unnecessary re-renders, but we have seen issues caused by it misuse

import { ModelIdSymbol } from '../constants.js'
import type { PersonalNoteJson } from '../personal-note/index.js'
import PersonalNote from '../personal-note/index.js'
import { createIsInstance } from '../utils.js'

class PersonalNoteSet {
  _items: Map<string, PersonalNote>
  constructor(notes?: (PersonalNote | PersonalNoteJson)[]) {
    this._items = new Map() // <txId, PersonalNote>
    if (notes) {
      for (const item of notes) {
        const note = coerceToPersonalNote(item)
        this._items.set(String(note), note)
      }
    }
  }

  static fromArray(arr?: (PersonalNote | PersonalNoteJson)[] | null) {
    return arr == null ? PersonalNoteSet.EMPTY : new PersonalNoteSet(arr)
  }

  static get [ModelIdSymbol]() {
    return 'PersonalNoteSet'
  }

  static isInstance = createIsInstance(PersonalNoteSet)

  static [Symbol.hasInstance](instance: unknown): instance is PersonalNoteSet {
    return this.isInstance(instance)
  }

  static EMPTY = new PersonalNoteSet()

  // overwrites existing
  add(input: PersonalNote | PersonalNoteJson | (PersonalNote | PersonalNoteJson)[]) {
    // coerce to array
    const notes = coerceToArray(input)
    if (notes.length === 0) return this

    const candidates = PersonalNoteSet.fromArray(notes)
    const replaced = new Set()
    const toAdd: PersonalNote[] = []
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
  equals(otherSet: PersonalNoteSet) {
    if (this === otherSet) return true
    if (this.size !== otherSet.size) return false

    return [...this].every((note) => {
      const candidate = otherSet.get(note)
      return candidate?.equals(note)
    })
  }

  get(item: PersonalNote | string) {
    const txId = typeof item === 'string' ? item : item.txId
    if (!txId) {
      throw new Error('expected txId or Object/PersonalNote with property txId')
    }

    return this._items.get(txId)
  }

  has(item: PersonalNote | string) {
    return this._items.has(String(item))
  }

  toJSON() {
    return [...this].map((item) => item.toJSON())
  }

  // adds and/or updates notes
  update(items: (PersonalNote | PersonalNoteJson)[]) {
    const updated = items.map((item) => {
      const existingItem = this.get(item as PersonalNote)
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

const coerceToPersonalNote = (obj: PersonalNote | PersonalNoteJson) =>
  obj instanceof PersonalNote ? obj : PersonalNote.fromJSON(obj)

const coerceToArray = <T extends object>(obj: T | T[]) => (Array.isArray(obj) ? obj : [obj].flat())

export default PersonalNoteSet
