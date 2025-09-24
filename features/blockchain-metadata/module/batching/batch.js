import Action from './action.js'

export default class Batch {
  #actions = []
  #onCommit = null

  constructor({ onCommit }) {
    this.#onCommit = onCommit
  }

  updateAccountState({ assetName, walletAccount, newData }) {
    this.#actions.push({
      type: Action.UpdateAccountState,
      payload: { assetName, walletAccount, newData },
    })
    return this
  }

  removeAccountState({ assetName, walletAccount }) {
    this.#actions.push({ type: Action.RemoveAccountState, payload: { assetName, walletAccount } })
    return this
  }

  updateTxs({ assetName, walletAccount, txs }) {
    this.#actions.push({ type: Action.UpdateTxs, payload: { assetName, walletAccount, txs } })
    return this
  }

  addTxs({ assetName, walletAccount, txs }) {
    this.#actions.push({ type: Action.AddTxs, payload: { assetName, walletAccount, txs } })
    return this
  }

  removeTxs({ assetName, walletAccount, txs }) {
    this.#actions.push({ type: Action.RemoveTxs, payload: { assetName, walletAccount, txs } })
    return this
  }

  overwriteTxs({ assetName, walletAccount, txs, notifyReceivedTxs }) {
    this.#actions.push({
      type: Action.OverwriteTxs,
      payload: { assetName, walletAccount, txs, notifyReceivedTxs },
    })
    return this
  }

  clearTxs({ assetName, walletAccount }) {
    this.#actions.push({ type: Action.ClearTxs, payload: { assetName, walletAccount } })
    return this
  }

  async commit() {
    await this.#onCommit(this.#actions)
  }
}
