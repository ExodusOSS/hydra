import { PersonalNoteSet } from '@exodus/models'
import createStorage from '@exodus/storage-memory'
import delay from 'delay'

import createPersonalNotesAtom from '../../atoms/personal-notes.js'
import personalNotesDefinition from '../index.js'

const createPersonalNotes = personalNotesDefinition.factory

describe('personal-notes module', () => {
  const prepare = async () => {
    const pushToFusion = jest.fn()
    let channelOptions
    const fusion = {
      channel: jest.fn((options) => {
        channelOptions = options
        return {
          awaitProcessed: async () => {},
          push: pushToFusion,
        }
      }),
    }

    const storage = createStorage()
    const personalNotesAtom = createPersonalNotesAtom({ storage }).atom

    personalNotesAtom.get = jest.fn(personalNotesAtom.get)
    personalNotesAtom.set = jest.fn(personalNotesAtom.set)

    const personalNotes = createPersonalNotes({
      personalNotesAtom,
      fusion,
      logger: { debug: jest.fn() },
    })

    return {
      fusion,
      storage,
      channelOptions,
      pushToFusion,
      personalNotes,
      personalNotesAtom,
    }
  }

  const personalNotesBatch = [
    {
      txId: 'tx-id-1',
      message: 'test-1',
    },
    {
      txId: 'tx-id-2',
      message: 'test-2',
    },
  ].map((n) => ({ type: 'personalNotes', data: n }))

  const personalNotesBatchData = PersonalNoteSet.fromArray(personalNotesBatch.map((n) => n.data))

  it('should update atom when personal notes from fusion received', async () => {
    const { channelOptions, personalNotesAtom } = await prepare()
    await channelOptions.processBatch(personalNotesBatch)
    expect(personalNotesAtom.set).toBeCalledWith(personalNotesBatchData)
  })

  it('should update atom and push update to fusion when note created by user', async () => {
    const { personalNotesAtom, personalNotes, pushToFusion } = await prepare()
    await personalNotes.upsert({
      txId: 'tx-id-3',
      message: 'test-3',
    })
    expect(personalNotesAtom.set).toBeCalledWith(
      PersonalNoteSet.fromArray([
        {
          txId: 'tx-id-3',
          message: 'test-3',
        },
      ])
    )
    expect(pushToFusion.mock.calls.length).toEqual(1)
    expect(pushToFusion.mock.calls[0][0]).toEqual({
      type: 'personalNote',
      data: {
        txId: 'tx-id-3',
        message: 'test-3',
      },
    })
  })

  it('should not update atom and not push update to fusion when note created by user is the same as already stored', async () => {
    const { personalNotesAtom, personalNotes, pushToFusion } = await prepare()

    await personalNotesAtom.set(personalNotesBatchData)
    await personalNotes.upsert({
      txId: 'tx-id-2',
      message: 'test-2',
    })

    expect(pushToFusion.mock.calls.length).toEqual(0)
  })

  it('should update atom and push update to fusion when note message changed', async () => {
    const { personalNotesAtom, personalNotes, pushToFusion } = await prepare()

    await personalNotesAtom.set(personalNotesBatchData)
    await personalNotes.upsert({
      txId: 'tx-id-2',
      message: 'test-2-changed',
    })

    expect(personalNotesAtom.set).toBeCalledTimes(2)
    expect(pushToFusion.mock.calls.length).toEqual(1)
    expect(pushToFusion.mock.calls[0][0]).toEqual({
      type: 'personalNote',
      data: {
        txId: 'tx-id-2',
        message: 'test-2-changed',
      },
    })
  })

  it('should update atom and push update to fusion when note message empty', async () => {
    const { personalNotesAtom, personalNotes, pushToFusion } = await prepare()

    await personalNotesAtom.set(personalNotesBatchData)
    await personalNotes.upsert({
      txId: 'tx-id-2',
      message: '',
    })
    expect(personalNotesAtom.set).toBeCalledTimes(2)
    expect(pushToFusion.mock.calls.length).toEqual(1)
    expect(pushToFusion.mock.calls[0][0]).toEqual({
      type: 'personalNote',
      data: {
        txId: 'tx-id-2',
        message: '',
      },
    })
  })

  describe('two devices', () => {
    const processBatchMap = {
      a: undefined,
      b: undefined,
    }

    const createFusion = (processOneKey) => ({
      channel: jest.fn((options) => {
        processBatchMap[processOneKey] = jest.fn(options.processBatch)
        return {
          awaitProcessed: async () => {},
          push: async (item) => {
            processBatchMap.a([item])
            processBatchMap.b([item])
          },
        }
      }),
    })

    const fusionA = createFusion('a')
    const fusionB = createFusion('b')

    const personalNotesAtomA = createPersonalNotesAtom({ storage: createStorage() }).atom
    const personalNotesA = createPersonalNotes({
      personalNotesAtom: personalNotesAtomA,
      fusion: fusionA,
      logger: { debug: jest.fn() },
    })

    const personalNotesAtomB = createPersonalNotesAtom({ storage: createStorage() }).atom
    personalNotesAtomB.set = jest.fn(personalNotesAtomB.set)

    // eslint-disable-next-line no-unused-vars
    const personalNotesB = createPersonalNotes({
      personalNotesAtom: personalNotesAtomB,
      fusion: fusionB,
      logger: { debug: jest.fn() },
    })

    it("update in one instance causing processBatch for second shouldn't result in infinite updates", async () => {
      await personalNotesA.upsert({
        txId: 'tx-id-2',
        message: 'test-2',
      })

      // ensure we are not in the start of infinite `pushToFusion` call
      await delay(1)
      expect(processBatchMap.b).toHaveBeenCalledTimes(1)
      expect(processBatchMap.a).toHaveBeenCalledTimes(1)
      expect(personalNotesAtomB.set).toHaveBeenCalledTimes(1)
    })
  })

  it('should update atom and push update to fusion when note dapp field changed or added', async () => {
    const { personalNotesAtom, personalNotes, pushToFusion } = await prepare()

    await personalNotesAtom.set(
      PersonalNoteSet.fromArray([
        {
          txId: 'tx-id-1',
          message: 'test-1',
          dapp: {
            someField: 'foo',
          },
        },
        {
          txId: 'tx-id-2',
          message: 'test-2',
        },
      ])
    )

    await personalNotes.upsert({
      txId: 'tx-id-1',
      message: 'test-1',
      dapp: {
        someField: null,
        anotherField: 'added',
      },
    })

    await personalNotes.upsert({
      txId: 'tx-id-2',
      message: 'test-2',
      dapp: {
        foo: 'bar',
      },
    })
    await personalNotes.upsert({
      txId: 'tx-id-3',
      message: 'test-3',
      dapp: {
        bar: 'foo',
      },
    })

    expect(personalNotesAtom.set).toBeCalledTimes(4)
    expect(pushToFusion.mock.calls.length).toEqual(3)
    expect(pushToFusion.mock.calls[0][0].data).toEqual({
      dapp: {
        anotherField: 'added',
        someField: null,
      },
      message: 'test-1',
      txId: 'tx-id-1',
    })
    expect(pushToFusion.mock.calls[1][0].data).toEqual({
      dapp: {
        foo: 'bar',
      },
      message: 'test-2',
      txId: 'tx-id-2',
    })
    expect(pushToFusion.mock.calls[2][0].data).toEqual({
      txId: 'tx-id-3',
      message: 'test-3',
      dapp: {
        bar: 'foo',
      },
    })
  })

  it('should update atom and push update to fusion when note username field changed or added', async () => {
    const { personalNotesAtom, personalNotes, pushToFusion } = await prepare()

    await personalNotesAtom.set(
      PersonalNoteSet.fromArray([
        {
          txId: 'tx-id-1',
          message: 'test-1',
        },
        {
          txId: 'tx-id-2',
          message: 'test-2',
          username: 'a1',
        },
      ])
    )

    await personalNotes.upsert({
      txId: 'tx-id-1',
      message: 'test-1',
      username: 'added',
    })

    await personalNotes.upsert({
      txId: 'tx-id-2',
      message: 'test-2',
      username: 'changed',
    })
    await personalNotes.upsert({
      txId: 'tx-id-3',
      message: 'test-3',
      username: 'new',
    })

    expect(personalNotesAtom.set).toBeCalledTimes(4)
    expect(pushToFusion.mock.calls.length).toEqual(3)
    expect(pushToFusion.mock.calls[0][0].data).toEqual({
      message: 'test-1',
      txId: 'tx-id-1',
      username: 'added',
    })
    expect(pushToFusion.mock.calls[1][0].data).toEqual({
      message: 'test-2',
      txId: 'tx-id-2',
      username: 'changed',
    })
    expect(pushToFusion.mock.calls[2][0].data).toEqual({
      message: 'test-3',
      txId: 'tx-id-3',
      username: 'new',
    })
  })

  it('should update atom and push update to fusion when note providerData field changed or added', async () => {
    const { personalNotesAtom, personalNotes, pushToFusion } = await prepare()

    await personalNotesAtom.set(
      PersonalNoteSet.fromArray([
        {
          txId: 'tx-id-1',
          message: 'test-1',
        },
        {
          txId: 'tx-id-2',
          message: 'test-2',
          providerData: {
            network: 'ethereum',
            origin: 'https://ethereum.com',
          },
        },
      ])
    )

    await personalNotes.upsert({
      txId: 'tx-id-1',
      message: 'test-1',
      providerData: {
        network: 'ethereum',
        origin: 'https://added.com',
      },
    })

    await personalNotes.upsert({
      txId: 'tx-id-2',
      message: 'test-2',
      providerData: {
        network: 'algorand',
        origin: 'https://algorand.com',
      },
    })
    await personalNotes.upsert({
      txId: 'tx-id-3',
      message: 'test-3',
      providerData: {
        network: 'bitcoin',
        origin: 'https://bitcoin.com',
      },
    })

    expect(personalNotesAtom.set).toBeCalledTimes(4)
    expect(pushToFusion.mock.calls.length).toEqual(3)
    expect(pushToFusion.mock.calls[0][0].data).toEqual({
      txId: 'tx-id-1',
      message: 'test-1',
      providerData: {
        network: 'ethereum',
        origin: 'https://added.com',
      },
    })
    expect(pushToFusion.mock.calls[1][0].data).toEqual({
      txId: 'tx-id-2',
      message: 'test-2',
      providerData: {
        network: 'algorand',
        origin: 'https://algorand.com',
      },
    })
    expect(pushToFusion.mock.calls[2][0].data).toEqual({
      txId: 'tx-id-3',
      message: 'test-3',
      providerData: {
        network: 'bitcoin',
        origin: 'https://bitcoin.com',
      },
    })
  })

  it('should update atom and push update to fusion when note walletConnect field changed or added', async () => {
    const { personalNotesAtom, personalNotes, pushToFusion } = await prepare()

    await personalNotesAtom.set(
      PersonalNoteSet.fromArray([
        {
          txId: 'tx-id-1',
          message: 'test-1',
        },
        {
          txId: 'tx-id-2',
          message: 'test-2',
          walletConnect: {
            dappName: 'exodus',
            dappUrl: 'https://exodus.com',
          },
        },
      ])
    )

    await personalNotes.upsert({
      txId: 'tx-id-1',
      message: 'test-1',
      walletConnect: {
        dappName: '1inch',
        dappUrl: 'https://1inch.com',
      },
    })

    await personalNotes.upsert({
      txId: 'tx-id-2',
      message: 'test-2',
      walletConnect: {
        dappName: 'referrals',
        dappUrl: 'https://referrals.com',
      },
    })
    await personalNotes.upsert({
      txId: 'tx-id-3',
      message: 'test-3',
      walletConnect: {
        dappName: 'exodex',
        dappUrl: 'https://exodex.com',
      },
    })

    expect(personalNotesAtom.set).toBeCalledTimes(4)
    expect(pushToFusion.mock.calls.length).toEqual(3)
    expect(pushToFusion.mock.calls[0][0].data).toEqual({
      txId: 'tx-id-1',
      message: 'test-1',
      walletConnect: {
        dappName: '1inch',
        dappUrl: 'https://1inch.com',
      },
    })
    expect(pushToFusion.mock.calls[1][0].data).toEqual({
      txId: 'tx-id-2',
      message: 'test-2',
      walletConnect: {
        dappName: 'referrals',
        dappUrl: 'https://referrals.com',
      },
    })
    expect(pushToFusion.mock.calls[2][0].data).toEqual({
      txId: 'tx-id-3',
      message: 'test-3',
      walletConnect: {
        dappName: 'exodex',
        dappUrl: 'https://exodex.com',
      },
    })
  })

  it('should update atom and push update to fusion when note xmrInputs field changed or added', async () => {
    const { personalNotesAtom, personalNotes, pushToFusion } = await prepare()

    await personalNotesAtom.set(
      PersonalNoteSet.fromArray([
        {
          txId: 'tx-id-1',
          message: 'test-1',
        },
        {
          txId: 'tx-id-2',
          message: 'test-2',
          xmrInputs: {
            txId: '2',
          },
        },
      ])
    )

    await personalNotes.upsert({
      txId: 'tx-id-1',
      message: 'test-1',
      xmrInputs: {
        txId: '1-new',
      },
    })

    await personalNotes.upsert({
      txId: 'tx-id-2',
      message: 'test-2',
      xmrInputs: {
        txId: '2-new',
      },
    })
    await personalNotes.upsert({
      txId: 'tx-id-3',
      message: 'test-3',
      xmrInputs: {
        txId: '3-new',
      },
    })

    expect(personalNotesAtom.set).toBeCalledTimes(4)
    expect(pushToFusion.mock.calls.length).toEqual(3)
    expect(pushToFusion.mock.calls[0][0].data).toEqual({
      txId: 'tx-id-1',
      message: 'test-1',
      xmrInputs: {
        txId: '1-new',
      },
    })
    expect(pushToFusion.mock.calls[1][0].data).toEqual({
      txId: 'tx-id-2',
      message: 'test-2',
      xmrInputs: {
        txId: '2-new',
      },
    })
    expect(pushToFusion.mock.calls[2][0].data).toEqual({
      txId: 'tx-id-3',
      message: 'test-3',
      xmrInputs: {
        txId: '3-new',
      },
    })
  })

  it('throws when upsert called without txid', async () => {
    const { personalNotes } = await prepare()
    await expect(() =>
      personalNotes.upsert({
        message: 'test-1',
        providerData: {
          network: 'ethereum',
          origin: 'https://added.com',
        },
      })
    ).rejects.toThrow('provide txId to set personal note')
  })

  it('should clear personal notes on clear', async () => {
    const { storage, personalNotesAtom, personalNotes } = await prepare()

    await expect(storage.get('data')).resolves.toEqual(undefined)
    await expect(personalNotesAtom.get()).resolves.toEqual(PersonalNoteSet.EMPTY)

    const note = { txId: 'tx-id-3', message: 'test-3' }

    await personalNotes.upsert(note)

    await expect(storage.get('data')).resolves.toEqual([note])
    await expect(personalNotesAtom.get()).resolves.toEqual(PersonalNoteSet.fromArray([note]))

    await personalNotes.clear()

    await expect(storage.get('data')).resolves.toEqual(undefined)
    await expect(personalNotesAtom.get()).resolves.toEqual(PersonalNoteSet.EMPTY)
  })
})
