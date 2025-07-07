import { PersonalNote } from '@exodus/models'

import { setup } from '../utils.js'

describe('moneroSendTxs', () => {
  it('should return empty object if no monero notes', () => {
    const { store, selectors } = setup()

    expect(selectors.personalNotes.moneroSendTxs(store.getState())).toEqual({})
  })

  it('should return batch from id', () => {
    const { store, selectors, handleEvent } = setup()

    const note = { txId: 'some-tx', message: 'yo', xmrInputs: ['inputs'] }

    handleEvent('personalNotes', [PersonalNote.fromJSON(note)])

    expect(selectors.personalNotes.moneroSendTxs(store.getState())).toEqual({
      'some-tx': { txId: 'some-tx', inputs: ['inputs'] },
    })
  })
})
