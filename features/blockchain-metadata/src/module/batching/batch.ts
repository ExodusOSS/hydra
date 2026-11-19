import type {
  AssetSource,
  Batch as BatchInterface,
  BatchAction,
  OnCommit,
  OverwriteTxsParams,
  TxParams,
  UpdateAccountStateParams,
} from '../../types.js'
import Action from './action.js'

export default class Batch implements BatchInterface {
  #actions: BatchAction[] = []
  #onCommit: OnCommit

  constructor({ onCommit }: { onCommit: OnCommit }) {
    this.#onCommit = onCommit
  }

  updateAccountState({ assetName, walletAccount, newData }: UpdateAccountStateParams) {
    this.#actions.push({
      type: Action.UpdateAccountState,
      payload: { assetName, walletAccount, newData },
    })
    return this
  }

  removeAccountState({ assetName, walletAccount }: AssetSource) {
    this.#actions.push({ type: Action.RemoveAccountState, payload: { assetName, walletAccount } })
    return this
  }

  updateTxs({ assetName, walletAccount, txs }: TxParams) {
    this.#actions.push({ type: Action.UpdateTxs, payload: { assetName, walletAccount, txs } })
    return this
  }

  addTxs({ assetName, walletAccount, txs }: TxParams) {
    this.#actions.push({ type: Action.AddTxs, payload: { assetName, walletAccount, txs } })
    return this
  }

  removeTxs({ assetName, walletAccount, txs }: TxParams) {
    this.#actions.push({ type: Action.RemoveTxs, payload: { assetName, walletAccount, txs } })
    return this
  }

  overwriteTxs({ assetName, walletAccount, txs, notifyReceivedTxs }: OverwriteTxsParams) {
    this.#actions.push({
      type: Action.OverwriteTxs,
      payload: { assetName, walletAccount, txs, notifyReceivedTxs },
    })
    return this
  }

  clearTxs({ assetName, walletAccount }: AssetSource) {
    this.#actions.push({ type: Action.ClearTxs, payload: { assetName, walletAccount } })
    return this
  }

  async commit() {
    await this.#onCommit(this.#actions)
  }
}
