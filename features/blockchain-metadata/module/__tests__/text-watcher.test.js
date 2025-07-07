import { connectAsset } from '@exodus/assets'
import { createInMemoryAtom } from '@exodus/atoms'
import { mapValues } from '@exodus/basic-utils'
import { asset as _ethereum } from '@exodus/ethereum-meta'
import { normalizeTxsJSON, TxSet } from '@exodus/models'

import txWatcherModuleDefinition from '../tx-watcher.js'
import fixtures from './test-watcher-fixtures.cjs'

const ethereum = connectAsset(_ethereum)

const getInstance = () => {
  const atom = createInMemoryAtom({
    defaultValue: { value: {} },
  })
  const txWatcher = txWatcherModuleDefinition.factory({
    logger: { ...console, fatal: console.log },
    txLogsAtom: atom,
  })

  return { atom, txWatcher }
}

const getFixture = (type) => {
  return mapValues(fixtures.find((f) => f.type === type)?.data, (txsByAssetName) =>
    mapValues(txsByAssetName, (txs) => {
      return TxSet.fromArray(normalizeTxsJSON({ json: txs, assets: { ethereum } }))
    })
  )
}

describe('TxWatcher', () => {
  it('should return tx', async () => {
    const { atom, txWatcher } = getInstance()
    const fixture = getFixture('success')

    setTimeout(() => atom.set({ value: fixture }), 100)
    const tx = await txWatcher.watch({
      assetName: 'ethereum',
      txId: '0x1a4770753057afafd1a9ca64aea5f7127871b5825feb983a3a26c7866f666420',
      walletAccount: 'exodus_0',
    })

    expect(tx?.confirmed).toBe(true)
  })
  it('should throw if tx did not confirm', async () => {
    const { atom, txWatcher } = getInstance()
    const fixture = getFixture('failed')

    setTimeout(() => atom.set({ value: fixture }), 100)
    await expect(
      txWatcher.watch({
        assetName: 'ethereum',
        txId: '0x35a9b9b3948cc2155f82801ee0a97b1c14952a9e6e2fef06474d8ee7e38d422e',
        walletAccount: 'exodus_0',
      })
    ).rejects.toThrow(/did not confirm/)
  })
  it('should throw if timedout', async () => {
    const { txWatcher } = getInstance()

    await expect(
      txWatcher.watch({
        assetName: 'ethereum',
        txId: '0x1a4770753057afafd1a9ca64aea5f7127871b5825feb983a3a26c7866f666420',
        walletAccount: 'exodus_0',
        timeout: 100,
      })
    ).rejects.toThrow(/rejected by timeout/)
  })
  it('should throw if atom is updated but not with expected value', async () => {
    const { atom, txWatcher } = getInstance()
    const fixture = getFixture('success')

    setTimeout(() => atom.set({ value: fixture }), 100)

    await expect(
      txWatcher.watch({
        assetName: 'ethereum',
        txId: '0x837a830257afafd1a9ca64aea5f7127871b5825feb983a3a29911130119', // not part of the atom.
        walletAccount: 'exodus_0',
        timeout: 100,
      })
    ).rejects.toThrow(/rejected by timeout/)
  })
})
