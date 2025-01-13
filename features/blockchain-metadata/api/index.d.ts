import type { TxSet, Tx, AccountState } from '@exodus/models'

type AssetSource = { walletAccount: string; assetName: string }
type AssetSourceData<T> = { [walletAccount: string]: { [assetName: string]: T } }

export interface BlockchainMetadataApi {
  getTxLog(params: AssetSource): Promise<TxSet>
  updateTxs(params: { txs: Tx[] } & AssetSource): Promise<void>
  removeTxs(params: { txs: Tx[] } & AssetSource): Promise<void>
  overwriteTxs(params: { txs: Tx[]; notifyReceivedTxs?: boolean } & AssetSource): Promise<void>
  clearTxs(params: AssetSource): Promise<void>
  getAccountState(params: AssetSource): Promise<AccountState>
  updateAccountState(params: { newData: AccountState } & AssetSource): Promise<void>
  removeAccountState(params: AssetSource): Promise<void>
  isUsedRecipientAddress(params: { address: string } & AssetSource): Promise<boolean>
}

declare const blockchainMetadataApiDefinition: {
  id: 'blockchainMetadataApi'
  type: 'api'
  factory(): {
    blockchainMetadata: BlockchainMetadataApi
  }
}

export default blockchainMetadataApiDefinition
