import { connectAsset } from '@exodus/assets'
import { createInMemoryAtom } from '@exodus/atoms'
import { asset as _bitcoin } from '@exodus/bitcoin-meta'
import { normalizeTxsJSON, TxSet } from '@exodus/models'

import type { Analytics, TxLogsAtomValue } from '../../types.js'
import createBlockchainAnalyticsPlugin from '../analytics.js'

const bitcoin = connectAsset(_bitcoin)
const assets = { bitcoin }

type AnalyticsTx = {
  received: boolean
  sent: boolean
  date: Date
}

const pastDate = ({ days }: { days: number }) => {
  const currentDate = new Date()
  const pastDate = new Date()

  pastDate.setDate(currentDate.getDate() - days)

  return pastDate
}

const buildTxJson = ({ sent, date }: AnalyticsTx, i: number) => ({
  txId: `tx-${i}-${date.getTime()}`,
  date,
  coinName: 'bitcoin',
  // Tx.sent === true iff coinAmount is negative OR `to` is set OR selfSend.
  // Use `to` for the sent case; received is the default (no `to`).
  ...(sent && { to: `to-${i}` }),
})

const createTxLogs = (txs: AnalyticsTx[]): TxLogsAtomValue => ({
  value: {
    exodus_0: {
      bitcoin: TxSet.fromArray(normalizeTxsJSON({ json: txs.map(buildTxJson), assets })),
    },
  },
})

describe('blockchainAnalyticsPlugin', () => {
  let plugin: ReturnType<typeof createBlockchainAnalyticsPlugin>
  let analytics: Analytics
  let txLogsAtom: ReturnType<typeof createInMemoryAtom<TxLogsAtomValue>>

  beforeEach(() => {
    txLogsAtom = createInMemoryAtom<TxLogsAtomValue>({ defaultValue: { value: {} } })
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

  it('should set parameters to false if no txlogs', async () => {
    await txLogsAtom.set({ value: {} })

    await plugin.onStart()

    await new Promise(setImmediate)

    expect(analytics.setDefaultEventProperties).toHaveBeenCalledWith({
      assetReceivedLast90: false,
      assetSentLast90: false,
    })
  })

  it('should set parameters to false if no new txlogs', async () => {
    await txLogsAtom.set(
      createTxLogs([
        { received: false, sent: true, date: pastDate({ days: 100 }) },
        { received: true, sent: false, date: pastDate({ days: 100 }) },
      ])
    )

    await plugin.onStart()

    await new Promise(setImmediate)

    expect(analytics.setDefaultEventProperties).toHaveBeenCalledWith({
      assetReceivedLast90: false,
      assetSentLast90: false,
    })
  })

  it('should set sent last 90 to true when txlogs exist', async () => {
    await txLogsAtom.set(
      createTxLogs([
        { received: true, sent: false, date: pastDate({ days: 100 }) },
        { received: false, sent: true, date: pastDate({ days: 10 }) },
      ])
    )

    await plugin.onStart()

    await new Promise(setImmediate)

    expect(analytics.setDefaultEventProperties).toHaveBeenCalledWith({
      assetReceivedLast90: false,
      assetSentLast90: true,
    })
  })

  it('should set receive last 90 to true when txlogs exist', async () => {
    await txLogsAtom.set(
      createTxLogs([
        { received: false, sent: true, date: pastDate({ days: 100 }) },
        { received: true, sent: false, date: pastDate({ days: 10 }) },
      ])
    )

    await plugin.onStart()

    await new Promise(setImmediate)

    expect(analytics.setDefaultEventProperties).toHaveBeenCalledWith({
      assetReceivedLast90: true,
      assetSentLast90: false,
    })
  })

  it('should set sent last 90 to true when new sent activity appears', async () => {
    await txLogsAtom.set({ value: {} })

    await plugin.onStart()

    await new Promise(setImmediate)

    await txLogsAtom.set(
      createTxLogs([{ received: false, sent: true, date: pastDate({ days: 0 }) }])
    )

    expect(analytics.setDefaultEventProperties).toHaveBeenCalledWith({
      assetReceivedLast90: false,
      assetSentLast90: true,
    })
  })

  it('should set sent last 90 to true when new receive activity appears', async () => {
    await txLogsAtom.set({ value: {} })

    await plugin.onStart()

    await new Promise(setImmediate)

    await txLogsAtom.set(
      createTxLogs([{ received: true, sent: false, date: pastDate({ days: 0 }) }])
    )

    expect(analytics.setDefaultEventProperties).toHaveBeenCalledWith({
      assetReceivedLast90: true,
      assetSentLast90: false,
    })
  })

  it('should set properties to true when new txlogs are present', async () => {
    await txLogsAtom.set(
      createTxLogs([
        { received: true, sent: false, date: pastDate({ days: 100 }) },
        { received: false, sent: true, date: pastDate({ days: 90 }) },
        { received: true, sent: false, date: pastDate({ days: 85 }) },
        { received: false, sent: true, date: pastDate({ days: 80 }) },
        { received: true, sent: false, date: pastDate({ days: 40 }) },
        { received: false, sent: true, date: pastDate({ days: 30 }) },
      ])
    )

    await plugin.onStart()

    await new Promise(setImmediate)

    expect(analytics.setDefaultEventProperties).toHaveBeenCalledWith({
      assetReceivedLast90: true,
      assetSentLast90: true,
    })
  })
})
