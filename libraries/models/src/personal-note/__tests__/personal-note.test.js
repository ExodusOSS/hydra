import test from '../../../_test.js'
import PersonalNote from '../index.js'

const transferNoteJSON = {
  txId: 'aaaa',
  message: 'buying unhealthy food',
}

const transferNote = PersonalNote.fromJSON(transferNoteJSON)

test('string "txId" is required', (t) => {
  t.throws(() => PersonalNote.fromJSON({}), /txId/)
  t.throws(() => PersonalNote.fromJSON({ txId: 123 }), /txId/)
  t.end()
})

test('fromJSON() / toJSON()', (t) => {
  ;[
    //
    { txId: 'deadbeef', message: 'tastes like chicken' },
    transferNoteJSON,
  ].forEach((json) => {
    const reexported = PersonalNote.fromJSON(json).toJSON()
    for (const key in json) {
      t.equal(json[key], reexported[key], `property ${key} survived fromJSON / toJSON`)
    }
  })

  const fromString = PersonalNote.fromJSON(JSON.stringify(transferNoteJSON)).toJSON()
  const fromObj = PersonalNote.fromJSON(transferNoteJSON).toJSON()

  t.same(fromString, fromObj, 'fromJSON supports string and object')
  t.end()
})

test('has properties after initialization', (t) => {
  const transfer = PersonalNote.fromJSON(transferNoteJSON)
  t.equal(transfer.txId, transferNoteJSON.txId)
  t.equal(transfer.message, transferNoteJSON.message)
  t.end()
})

test('equals()', (t) => {
  t.assert(transferNote.equals(transferNote), 'notes are equal by reference')

  const copy = PersonalNote.fromJSON(transferNoteJSON)
  const modified = PersonalNote.fromJSON({
    ...transferNoteJSON,
    message: transferNoteJSON.message + 'abc',
  })

  t.equal(transferNote.equals(copy), true, 'notes are equal by value')
  t.equal(transferNote.equals(modified), false, 'different notes are not equal')
  t.equal(transferNote.equals(), false, 'undefined is not equal')

  t.end()
})

test('toString()', (t) => {
  t.equal(transferNote.toString(), transferNoteJSON.txId, 'toString() returns txId')
  t.end()
})

test('update()', (t) => {
  t.equal(
    transferNote.update(transferNote.toJSON()),
    transferNote,
    'update() returns same instance if nothing changed'
  )

  t.equal(
    transferNote.update({
      message: transferNote.message + 'abc',
    }) === transferNote,
    false,
    'update() returns a new instance if something changed'
  )

  t.throws(() => transferNote.update({ txId: 'zzz' }), /txId/, 'note.txId is not modifiable')

  t.same(transferNote.toJSON(), transferNoteJSON, `original note is unmodified`)
  t.end()
})

test('custom props', (t) => {
  const dappNoteJSON = {
    ...transferNoteJSON,
    someBool: true,
    someArray: [1, 3, Number.POSITIVE_INFINITY],
    someNum: 10,
  }

  const dappNote = PersonalNote.fromJSON(dappNoteJSON)
  t.same(dappNote.toJSON(), dappNoteJSON, 'fromJSON/toJSON roundtrip works for custom props')

  const update1 = {
    someArray: [1, 3],
    someNewProp: 'excellent data',
  }
  t.same(
    dappNote.update(update1).toJSON(),
    { ...dappNoteJSON, ...update1 },
    'supports updates on custom props'
  )

  t.same(
    dappNote.update(update1).equals(dappNote.update(update1)),
    true,
    'equals() works for equal custom props'
  )

  t.same(
    dappNote
      .update({
        good: true,
      })
      .equals(
        dappNote.update({
          good: false,
        })
      ),
    false,
    'equals() respects unequal custom props'
  )
})

test('getMessage', (t) => {
  t.same(PersonalNote.fromJSON(transferNoteJSON).getMessage(), transferNoteJSON.message)
  t.same(
    PersonalNote.fromJSON(transferNoteJSON).getMessage({ to: 'bbb' }),
    transferNoteJSON.message
  )

  const complex = {
    txId: 'aaaa',
    message: 'buying unhealthy food',
    sends: {
      bBb: {
        message: 'ha',
      },
    },
  }

  t.same(
    PersonalNote.fromJSON(complex).getMessage({ to: 'bbb' }),
    complex.sends.bBb.message,
    'works with defined "to"'
  )
  t.same(
    PersonalNote.fromJSON(complex).getMessage({ to: 'bBb' }),
    complex.sends.bBb.message,
    'works for mixed case "to"'
  )
  t.same(PersonalNote.fromJSON(complex).getMessage(), complex.message, 'falls back to .message')
})

test('setMessage', (t) => {
  const complexJSON = {
    txId: 'aaaa',
    message: 'buying unhealthy food',
    sends: {
      bBb: {
        message: 'ha',
      },
    },
  }

  const complex = PersonalNote.fromJSON(complexJSON)
  const update = {
    to: 'bbb',
    message: 'ho',
  }

  t.same(
    complex.setMessage(update).toJSON().sends.bBb.message,
    null,
    'stripped message stored under mixed case address'
  )

  t.equal(complex.setMessage(update).getMessage({ to: 'bbb' }), update.message)
  t.equal(complexJSON.sends.bBb.message, 'ha', 'original json not mutated')
})
