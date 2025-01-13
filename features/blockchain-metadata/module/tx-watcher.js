import { waitUntil } from '@exodus/atoms'

export class TxWatcher {
  #txLogsAtom

  constructor({ txLogsAtom }) {
    this.#txLogsAtom = txLogsAtom
  }

  watch = async ({ assetName, timeout, txId, walletAccount }) => {
    const getTxFromAtom = ({ value }) => {
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

      const tx = getTxFromAtom(txLog)
      if (tx.failed) {
        throw new Error(`Transaction ${tx.txId} did not confirm`)
      }

      return tx
    } catch (err) {
      throw new Error(`Failed to approve tokens for ${assetName}: ${err.message}`)
    }
  }
}

const createTxWatcher = (args) => new TxWatcher({ ...args })

const txWatcherModuleDefinition = {
  id: 'txWatcher',
  type: 'module',
  factory: createTxWatcher,
  dependencies: ['txLogsAtom'],
  public: true,
}

export default txWatcherModuleDefinition
