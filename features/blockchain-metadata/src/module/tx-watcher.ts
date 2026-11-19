import { waitUntil } from '@exodus/atoms'
import type { Definition } from '@exodus/dependency-types'
import type { AssetSource, TxLogsAtom, TxLogsAtomValue, TxWatcher } from '../types.js'
import type { Tx } from '@exodus/models'

class TxWatcherImpl implements TxWatcher {
  #txLogsAtom

  constructor({ txLogsAtom }: { txLogsAtom: TxLogsAtom }) {
    this.#txLogsAtom = txLogsAtom
  }

  watch = async ({
    assetName,
    timeout,
    txId,
    walletAccount,
  }: AssetSource & { timeout: number; txId: string }): Promise<Tx> => {
    const getTxFromAtom = ({ value }: TxLogsAtomValue) => {
      const walletAccountTxLogs = value[walletAccount]

      if (!walletAccountTxLogs) {
        return
      }

      const assetTxLogs = walletAccountTxLogs[assetName]
      if (!assetTxLogs) {
        return
      }

      const tx = assetTxLogs.get(txId)
      return tx && !tx.pending ? tx : undefined
    }

    try {
      const txLog = await waitUntil({
        atom: this.#txLogsAtom,
        rejectAfter: timeout,
        predicate: (value) => Boolean(getTxFromAtom(value)),
      })

      const tx = getTxFromAtom(txLog)!
      if (tx.failed) {
        throw new Error(`Transaction ${tx.txId} did not confirm`)
      }

      return tx
    } catch (err) {
      throw new Error(`Failed to approve tokens for ${assetName}: ${(err as Error).message}`)
    }
  }
}

export { TxWatcherImpl as TxWatcher }

const createTxWatcher = (args: { txLogsAtom: TxLogsAtom }): TxWatcher =>
  new TxWatcherImpl({ ...args })

const txWatcherModuleDefinition = {
  id: 'txWatcher',
  type: 'module',
  factory: createTxWatcher,
  dependencies: ['txLogsAtom'] as const,
  public: true,
} as const satisfies Definition

export default txWatcherModuleDefinition
