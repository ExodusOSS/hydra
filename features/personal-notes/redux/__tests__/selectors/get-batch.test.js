import { PersonalNote } from '@exodus/models'

import { setup } from '../utils'

describe('getBatch', () => {
  it('should return undefined if batchId not provided', () => {
    const { store, selectors } = setup()

    expect(selectors.personalNotes.getBatch(store.getState())()).toEqual(undefined)
  })

  it('should return undefined set if none personal notes', () => {
    const { store, selectors } = setup()

    expect(selectors.personalNotes.getBatch(store.getState())('some-id')).toEqual(undefined)
  })

  it('should return batch from id', () => {
    const { store, selectors, handleEvent } = setup()

    const batch = { id: 'some-id', batch: ['batch'] }
    const note = { txId: 'some-tx', message: 'yo', dapp: { batch } }

    handleEvent('personalNotes', [PersonalNote.fromJSON(note)])

    expect(selectors.personalNotes.getBatch(store.getState())('some-id')).toEqual(batch)
  })
})
