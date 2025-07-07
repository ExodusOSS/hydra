import { PersonalNote } from '@exodus/models'

import { setup } from '../utils.js'

describe('withBatchId', () => {
  it('should return personal notes with batch.id prop', () => {
    const { store, selectors, handleEvent } = setup()

    expect(selectors.personalNotes.withBatchId(store.getState()).toJSON()).toEqual([])

    const batch = { id: 'some-id', batch: ['batch'] }
    const note = { txId: 'some-tx', message: 'yo', dapp: { batch } }

    handleEvent('personalNotes', [
      PersonalNote.fromJSON({ txId: 'normal-tx', message: 'hi' }),
      PersonalNote.fromJSON(note),
    ])

    expect(selectors.personalNotes.withBatchId(store.getState()).toJSON()).toEqual([
      { dapp: { batch: { batch: ['batch'], id: 'some-id' } }, message: 'yo', txId: 'some-tx' },
    ])
  })
})
