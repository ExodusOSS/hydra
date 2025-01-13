const Action = {
  UpdateAccountState: Symbol.for('UpdateAccountState'),
  RemoveAccountState: Symbol.for('RemoveAccountState'),
  UpdateTxs: Symbol.for('UpdateTxs'),
  RemoveTxs: Symbol.for('RemoveTxs'),
  OverwriteTxs: Symbol.for('OverwriteTxs'),
  ClearTxs: Symbol.for('ClearTxs'),
}

export default Action
