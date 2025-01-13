import ExodusModule from '@exodus/module' // eslint-disable-line import/no-deprecated
import makeConcurrent from 'make-concurrent'
import { merge, identity } from 'lodash'
import { pickBy } from '@exodus/basic-utils'
import { PersonalNote } from '@exodus/models'

const personalNotesChannel = {
  type: 'personalNote',
  channelName: 'personalNotes',
  syncStateKey: 'sync:syncstate:personalnotes',
  batchSize: 100,
}

export const MODULE_ID = 'personalNotes'

class PersonalNotes extends ExodusModule {
  #channel = null
  #personalNotesAtom = null

  constructor({ fusion, personalNotesAtom, logger }) {
    super({ name: MODULE_ID, logger })
    this.#personalNotesAtom = personalNotesAtom

    this.#channel = fusion.channel({
      ...personalNotesChannel,
      processBatch: async (notes) => {
        await this.#update(
          notes.map((n) => n.data),
          { fromSync: true }
        )
      },
    })
  }

  #update = makeConcurrent(async (_personalNotesArray, { fromSync } = {}) => {
    const personalNotesArray = [_personalNotesArray]
      .flat()
      .map((personalNote) => pickBy(personalNote, (item) => item !== undefined))
    const personalNotesPre = await this.#personalNotesAtom.get()
    const personalNotesPost = personalNotesPre.update(personalNotesArray)
    if (personalNotesPre.equals(personalNotesPost)) {
      this._logger.debug('skip personal notes update, they are the same as stored')
      return
    }

    await this.#personalNotesAtom.set(personalNotesPost)

    if (!fromSync) {
      const channel = await this.#getChannel()
      for (const note of personalNotesArray) {
        const notePre = personalNotesPre.get(note.txId)
        const notePost = personalNotesPost.get(note.txId)
        if (!notePost.equals(notePre)) {
          const item = {
            type: personalNotesChannel.type,
            data: notePost.toJSON(),
          }

          await channel.push(item)
          this._logger.debug('pushed personal notes to fusion', notePost.toJSON())
        }
      }
    }
  })

  #getChannel = async () => {
    await this.#channel.awaitProcessed()

    return this.#channel
  }

  upsert = async ({
    txId,
    message = '',
    username,
    address,
    dapp,
    providerData,
    walletConnect,
    xmrInputs,
  }) => {
    const personalNotes = await this.#personalNotesAtom.get()
    if (!txId) {
      throw new Error('provide txId to set personal note')
    }

    const prevPersonalNote = personalNotes.get(txId)
    let personalNote =
      prevPersonalNote ||
      PersonalNote.fromJSON(
        pickBy(
          {
            txId,
            message: '',
            dapp,
            username,
            providerData,
            walletConnect,
            xmrInputs,
          },
          identity
        )
      )
    if (prevPersonalNote?.dapp || dapp) {
      personalNote = personalNote.update({ dapp: merge({}, personalNote.dapp, dapp) })
    }

    if (prevPersonalNote?.username || username) {
      personalNote = personalNote.update({ username })
    }

    if (prevPersonalNote?.providerData || providerData) {
      personalNote = personalNote.update({ providerData })
    }

    if (prevPersonalNote?.walletConnect || walletConnect) {
      personalNote = personalNote.update({ walletConnect })
    }

    if (prevPersonalNote?.xmrInputs || xmrInputs) {
      personalNote = personalNote.update({ xmrInputs })
    }

    personalNote = personalNote.setMessage({ to: address, message })
    await this.#update([personalNote])
  }

  clear = async () => {
    await this.#personalNotesAtom.reset()
  }
}

const createPersonalNotes = (args) => new PersonalNotes({ ...args })

// eslint-disable-next-line @exodus/export-default/named
export default {
  id: MODULE_ID,
  type: 'module',
  factory: createPersonalNotes,
  dependencies: ['fusion', 'personalNotesAtom', 'logger'],
  public: true,
}
