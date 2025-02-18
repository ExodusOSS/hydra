import test from '../../__tests__/_test.js'
import PersonalNote from '../../personal-note/index.js'
import PersonalNoteSet from '../index.js'
import fixtureSetJSON from './fixtures/personal-note-set.js'

test('toJSON() / fromArray() round trip', (t) => {
  const reexported1 = PersonalNoteSet.fromArray(fixtureSetJSON).toJSON()
  t.same(reexported1, fixtureSetJSON, 'fromArray(Object[]) / toJSON round trip ')

  const reexported2 = PersonalNoteSet.fromArray(fixtureSetJSON.map(PersonalNote.fromJSON)).toJSON()
  t.same(reexported2, fixtureSetJSON, 'fromArray(PersonalNote[]) / toJSON round trip')

  t.end()
})

test('fromArray() should convert undefined / null to empty set', (t) => {
  t.equal(PersonalNoteSet.fromArray([]).size, 0, 'fromArray([]) produces empty set')
  t.equal(PersonalNoteSet.fromArray().size, 0, 'fromArray(undefined) produces empty set')
  t.equal(PersonalNoteSet.fromArray(null).size, 0, 'fromArray(null) produces empty set')
  t.end()
})

test('has() / get()', (t) => {
  const set = PersonalNoteSet.fromArray(fixtureSetJSON)
  const [...notes] = set
  notes.forEach((note) => {
    t.equal(set.has(note), true, 'has() looks up by note')
    t.equal(set.has(note.txId), true, 'has() looks up by txId')
    t.equal(set.get(note), note, 'get() looks up by note')
    t.equal(set.get(note.txId), note, 'get() looks up by txId')
  })

  t.end()
})

test('add()', (t) => {
  const first = PersonalNote.fromJSON(fixtureSetJSON[0]!)
  const second = PersonalNote.fromJSON(fixtureSetJSON[1]!)
  const with1 = PersonalNoteSet.fromArray([first])
  const with2 = with1.add(second)

  t.assert(with2 !== with1, 'add() returns a new instance')
  t.equal(with2.has(second), true, 'add() adds new item')
  t.equal(
    with2.add([second.toJSON()]).get(second) === second,
    true,
    'add() keeps references for identical items'
  )

  const newMessage = first.message + 'abc'
  const updatedFirst = PersonalNote.fromJSON({ ...first, message: newMessage })
  const afterOverwrite = with2.add(updatedFirst)

  t.equal(afterOverwrite.size, with2.size, 'add() replaces item')

  const reAdded = afterOverwrite.get(first.txId)!
  t.equal(reAdded.message, newMessage, 'add() replaces note with same txId')

  const allNotes = PersonalNoteSet.fromArray(fixtureSetJSON)
  t.equal(with2.add(fixtureSetJSON).equals(allNotes), true, 'add() supports Object[]')
  t.equal(with2.add([...allNotes]).equals(allNotes), true, 'add() supports PersonalNote[]')

  t.end()
})

test('size', (t) => {
  let set = PersonalNoteSet.fromArray([])
  t.equal(set.size, 0, 'empty set has size 0')
  for (const [i, element] of fixtureSetJSON.entries()) {
    set = set.add(element)
    t.equal(set.size, i + 1)
  }

  for (let i = 0; i < fixtureSetJSON.length; i++) {
    set = set.update([
      {
        ...fixtureSetJSON[i]!,
        message: fixtureSetJSON[i]!.message + 'abc',
      },
    ])

    t.equal(set.size, fixtureSetJSON.length)
  }

  t.end()
})

test('update()', (t) => {
  const first = PersonalNote.fromJSON(fixtureSetJSON[0]!)
  const second = PersonalNote.fromJSON(fixtureSetJSON[1]!)

  const set = PersonalNoteSet.fromArray([first])
  t.equal(set.update([]) === set, true, 'update() returns same instance when nothing got updated')
  t.equal(
    set.update([second]) === set,
    false,
    'update() returns a new instance when something got updated'
  )

  t.equal(
    set.update([first]).get(first),
    first,
    'update() keeps existing note when update changes nothing'
  )

  const newMessage = first.message + 'abc'
  t.equal(
    set
      .update([
        {
          txId: first.txId,
          message: newMessage,
        },
      ])
      .get(first)!.message,
    newMessage,
    'update() updates individual notes in set'
  )

  t.equal(
    //
    set.update([second]).equals(set.add([second])),
    true,
    'update() adds new items'
  )

  const updatedFirst = { txId: first.txId, message: first.message + 'abc' }
  const withResolvedConflict = set.update([updatedFirst])

  t.equal(
    withResolvedConflict.get(first.txId)!.message,
    updatedFirst.message,
    'update() resolved conflict - replaced by txId'
  )

  t.equal(withResolvedConflict.size, set.size, 'update() size correct after conflict resolution')
  t.end()
})

test('equals()', (t) => {
  const first = PersonalNote.fromJSON(fixtureSetJSON[0]!)
  const set = PersonalNoteSet.fromArray(fixtureSetJSON)
  t.equal(set.equals(set), true, 'set equals() self')
  t.equal(set.equals(set.clone()), true, 'set equals() clone')

  const withUpdatedFirst = set.update([first.update({ message: first.message + 'abc' })])
  t.equal(set.equals(withUpdatedFirst), false, 'set does not equals() different set')

  const updatedFirst = { ...first.toJSON(), message: first.message + 'abc' }
  t.equal(set.equals(set.update([updatedFirst])), false, 'set equals() compares individual notes')

  t.end()
})
