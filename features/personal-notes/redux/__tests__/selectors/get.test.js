import { PersonalNote } from '@exodus/models'

import { setup } from '../utils.js'

describe('get', () => {
  it('should return null if txId not provided', () => {
    const { store, selectors } = setup()

    expect(selectors.personalNotes.get(store.getState())()).toEqual(null)
  })

  it('should return undefined set if none personal notes', () => {
    const { store, selectors } = setup()

    expect(selectors.personalNotes.get(store.getState())('some-id')).toEqual(undefined)
  })

  it('should return personal note from id', () => {
    const { store, selectors, handleEvent } = setup()

    const data = { txId: 'some-id', message: 'yo' }

    handleEvent('personalNotes', [PersonalNote.fromJSON(data)])

    expect(selectors.personalNotes.get(store.getState())(data.txId)).toEqual(data)
  })
})
