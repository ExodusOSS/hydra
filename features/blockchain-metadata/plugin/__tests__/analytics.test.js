import { createInMemoryAtom } from '@exodus/atoms'

import createBlockchainAnalyticsPlugin from '../analytics.js'

const pastDate = ({ days }) => {
  const currentDate = new Date()
  const pastDate = new Date()

  pastDate.setDate(currentDate.getDate() - days)

  return pastDate
}

class TxSetMock {
  constructor(txs) {
    this.txs = txs
    this.size = txs.length
  }

  getAt = (i) => this.txs[i]
}

const txSetMock = (txs) => new TxSetMock(txs)

describe('blockchainAnalyticsPlugin', () => {
  let plugin
  let analytics
  let txLogsAtom

  beforeEach(() => {
    txLogsAtom = createInMemoryAtom()
    analytics = { setDefaultEventProperties: jest.fn(), requireDefaultEventProperties: jest.fn() }
    plugin = createBlockchainAnalyticsPlugin({ analytics, txLogsAtom })
  })

  it('should require default parameters at start', async () => {
    await txLogsAtom.set({ value: {} })

    await plugin.onStart()

    expect(analytics.requireDefaultEventProperties).toHaveBeenCalledWith([
      'assetSentLast90',
      'assetReceivedLast90',
    ])
  })

  it('should set parameters as false if no txlogs', async () => {
    await txLogsAtom.set({ value: {} })

    await plugin.onStart()

    await new Promise(setImmediate)

    expect(analytics.setDefaultEventProperties).toHaveBeenCalledWith({
      assetReceivedLast90: false,
      assetSentLast90: false,
    })
  })

  it('should set parameters as false if no new txlogs', async () => {
    await txLogsAtom.set({
      value: {
        exodus_0: {
          bitcoin: txSetMock([
            { received: false, sent: true, date: pastDate({ days: 100 }) },
            { received: true, sent: false, date: pastDate({ days: 100 }) },
          ]),
        },
      },
    })

    await plugin.onStart()

    await new Promise(setImmediate)

    expect(analytics.setDefaultEventProperties).toHaveBeenCalledWith({
      assetReceivedLast90: false,
      assetSentLast90: false,
    })
  })

  it('should set sent last 90 as true when txlogs', async () => {
    await txLogsAtom.set({
      value: {
        exodus_0: {
          bitcoin: txSetMock([
            { received: true, sent: false, date: pastDate({ days: 100 }) },
            { received: false, sent: true, date: pastDate({ days: 10 }) },
          ]),
        },
      },
    })

    await plugin.onStart()

    await new Promise(setImmediate)

    expect(analytics.setDefaultEventProperties).toHaveBeenCalledWith({
      assetReceivedLast90: false,
      assetSentLast90: true,
    })
  })

  it('should set receive last 90 as true when txlogs', async () => {
    await txLogsAtom.set({
      value: {
        exodus_0: {
          bitcoin: txSetMock([
            { received: false, sent: true, date: pastDate({ days: 100 }) },
            { received: true, sent: false, date: pastDate({ days: 10 }) },
          ]),
        },
      },
    })

    await plugin.onStart()

    await new Promise(setImmediate)

    expect(analytics.setDefaultEventProperties).toHaveBeenCalledWith({
      assetReceivedLast90: true,
      assetSentLast90: false,
    })
  })

  it('should set sent last 90 as true when new sent activity', async () => {
    await txLogsAtom.set({ value: {} })

    await plugin.onStart()

    await new Promise(setImmediate)

    await txLogsAtom.set({
      value: {
        exodus_0: {
          bitcoin: txSetMock([{ received: false, sent: true, date: pastDate({ days: 0 }) }]),
        },
      },
    })

    expect(analytics.setDefaultEventProperties).toHaveBeenCalledWith({
      assetReceivedLast90: false,
      assetSentLast90: true,
    })
  })

  it('should set sent last 90 as true when new receive activity', async () => {
    await txLogsAtom.set({ value: {} })

    await plugin.onStart()

    await new Promise(setImmediate)

    await txLogsAtom.set({
      value: {
        exodus_0: {
          bitcoin: txSetMock([{ received: true, sent: false, date: pastDate({ days: 0 }) }]),
        },
      },
    })

    expect(analytics.setDefaultEventProperties).toHaveBeenCalledWith({
      assetReceivedLast90: true,
      assetSentLast90: false,
    })
  })

  it('should set properties as true when new there are new txlogs', async () => {
    await txLogsAtom.set({
      value: {
        exodus_0: {
          bitcoin: txSetMock([
            { id: 1, received: true, sent: false, date: pastDate({ days: 100 }) },
            { id: 2, received: false, sent: true, date: pastDate({ days: 90 }) },
            { id: 3, received: true, sent: false, date: pastDate({ days: 85 }) },
            { id: 4, received: false, sent: true, date: pastDate({ days: 80 }) },
            { id: 5, received: true, sent: false, date: pastDate({ days: 40 }) },
            { id: 6, received: false, sent: true, date: pastDate({ days: 30 }) },
          ]),
        },
      },
    })

    await plugin.onStart()

    await new Promise(setImmediate)

    expect(analytics.setDefaultEventProperties).toHaveBeenCalledWith({
      assetReceivedLast90: true,
      assetSentLast90: true,
    })
  })
})
