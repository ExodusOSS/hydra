import lodash from 'lodash'

import { TX_EXPORT_FIELDS } from './constants.js'
import { formatTransactionOutput } from './utils.js'

const { get } = lodash

class ExportTransactions {
  #blockchainMetadata = null
  #assetsModule = null
  #personalNotesAtom = null
  #enabledWalletAccountsAtom = null
  #multipleWalletAccountsEnabledAtom = null
  #ordersAtom = null

  constructor({
    blockchainMetadata,
    assetsModule,
    personalNotesAtom,
    enabledWalletAccountsAtom,
    multipleWalletAccountsEnabledAtom,
    ordersAtom,
  }) {
    this.#blockchainMetadata = blockchainMetadata
    this.#assetsModule = assetsModule

    this.#enabledWalletAccountsAtom = enabledWalletAccountsAtom
    this.#multipleWalletAccountsEnabledAtom = multipleWalletAccountsEnabledAtom
    this.#personalNotesAtom = personalNotesAtom
    this.#ordersAtom = ordersAtom
  }

  #getAsset = (assetName) => this.#assetsModule.getAsset(assetName)

  #getTxOppositeWalletAccount = async (tx) => {
    const multipleWalletAccountsEnabled = await this.#multipleWalletAccountsEnabledAtom.get()
    if (!multipleWalletAccountsEnabled) return null

    const enabledWalletAccounts = Object.keys(await this.#enabledWalletAccountsAtom.get())

    const { type, transfer, toWalletAccount, fromWalletAccount } = tx.data

    if (
      transfer &&
      toWalletAccount &&
      type === 'withdrawal' &&
      enabledWalletAccounts.includes(toWalletAccount)
    ) {
      return toWalletAccount
    }

    if (
      transfer &&
      fromWalletAccount &&
      type === 'deposit' &&
      enabledWalletAccounts.includes(fromWalletAccount)
    ) {
      return fromWalletAccount
    }

    const txLogs = await this.#blockchainMetadata.getLoadedTxLogs()

    return enabledWalletAccounts.find((walletAccount) => {
      const txSet = get(txLogs, [walletAccount, tx.coinName])
      if (!txSet) return false
      const oppositeTx = txSet.get(tx.txId)
      return oppositeTx && oppositeTx.sent !== tx.sent
    })
  }

  #getTxStakingType = (tx) => {
    if (!tx || typeof tx !== 'object') return null

    const { data = {} } = tx

    if (
      data.type === 'delegate' ||
      data.type === 'stake' ||
      data.type === 'staking' ||
      data?.delegate !== undefined ||
      data.staking?.method === 'delegate' ||
      data.staking?.method === 'createAccountWithSeed' ||
      data?.txType === 'addStake'
    ) {
      return 'staked'
    }

    if (
      data.type === 'undelegate' ||
      data.type === 'unstake' ||
      data.type === 'unstaking' ||
      data?.undelegate !== undefined ||
      data.delegation === 'undelegate' ||
      data.staking?.method === 'undelegate' ||
      data?.txType === 'unlock'
    ) {
      return 'unstaked'
    }

    if (
      data.type === 'reward' ||
      data.type === 'claim' ||
      data.claim === true ||
      data.withdraw === true
    ) {
      return 'claimed'
    }

    return null
  }

  #prepareTxForExport = async ({ tx, walletAccount, personalNotes }) => {
    let isWithdrawal = tx.sent && !tx.coinAmount.isPositive
    const stakingType = this.#getTxStakingType(tx)

    let coinAmount = tx.coinAmount
    const assetName = tx.coinName
    const asset = this.#getAsset(assetName)
    const coinCurrency = asset.displayTicker || tx.coinAmount.defaultUnit.unitName
    let feeAmount = tx.feeAmount && tx.feeAmount.negate()
    if (tx.data && tx.data.delegatorFee) {
      feeAmount = asset.currency.baseUnit(tx.data.delegatorFee).negate()
    }

    const feeCurrency = tx.feeAmount ? tx.feeAmount.defaultUnit.unitName : ''
    const personalNote = personalNotes.get(tx.txId)

    switch (assetName) {
      case 'algorand': {
        if (tx.selfSend && tx.coinAmount.isZero) {
          isWithdrawal = false
          coinAmount = asset.currency.baseUnit(tx.data.rewardAmount) // reward tx
        }

        break
      }

      case 'cardano': {
        if (tx.selfSend && tx.coinAmount.isZero) {
          isWithdrawal = false
          coinAmount = asset.currency.baseUnit(tx.data.reward || 0) // reward tx
        }

        const fee = tx.feeAmount ?? asset.currency.baseUnit(0)

        // When staking, a 2 ADA deposit is taken. This deposit is returned upon Unstaking.
        if (tx.data && tx.data.delegate) {
          feeAmount = fee.abs().add(asset.ADA_KEY_DEPOSIT_FEE).negate() // staking txn
        } else if (tx.data && tx.data.delegate === null) {
          feeAmount = asset.ADA_KEY_DEPOSIT_FEE.sub(fee.abs()) // unstaking txn
        }

        break
      }

      case 'solana': {
        if (tx.selfSend && get(tx, 'data.staking.method') === 'withdraw') {
          isWithdrawal = false
          coinAmount = asset.currency.baseUnit(tx.data.staking.stake) // reward tx
        }

        break
      }
    }

    const type = stakingType || (isWithdrawal ? 'withdrawal' : 'deposit')

    const oppositeWalletAccount = await this.#getTxOppositeWalletAccount(tx)

    return formatTransactionOutput({
      tx,
      type,
      asset,
      coinAmount,
      coinCurrency,
      feeAmount,
      feeCurrency,
      personalNote,
      walletAccount,
      oppositeWalletAccount,
    })
  }

  #addOrderData = async (txs) => {
    const orders = await this.#ordersAtom.get()
    let resultTxs = [...txs]

    const txIndexesToRemove = new Set()
    for (const order of orders) {
      if (order.status !== 'complete-verified') continue

      const fromTxIndex = resultTxs.findIndex((tx) => tx.outTxId === order.fromTxId)
      const toTxIndex = resultTxs.findIndex(
        (tx) => tx.inTxId === order.toTxId && tx.type === 'deposit'
      )
      if (fromTxIndex === -1 && toTxIndex === -1) continue

      // order.toAmount is missing in some cases, so get all data from resultTxs[toTxIndex] where possible
      // exception is when ordersWithSameToTxId > 1, then we need to grab inAmount from order.toAmount if it exists, leave blank if it doesn't
      const ordersWithSameToTxId = orders
        .getAllByTxId(order.toTxId)
        .filter((order) => order.exodusStatus !== 'syncing')

      const mergeObj = {
        type: 'exchange',
        orderId: order.orderId,
        fromPortfolio: order.fromWalletAccount,
        toPortfolio: order.toWalletAccount,
      }

      if (fromTxIndex !== -1) {
        const txLog = await this.#blockchainMetadata.getTxLog({
          assetName: order.toAsset,
          walletAccount: mergeObj.toPortfolio,
        })
        const toTx = txLog.get(order.toTxId)
        if (!toTx) continue
        const toAssetName = toTx.coinName
        const toAsset = this.#getAsset(toAssetName)
        const inCurrency = toAsset.displayTicker || toAsset.ticker
        let inAmount
        if (ordersWithSameToTxId.length > 1) {
          inAmount = order.toAmount ? order.toAmount.toDefaultNumber() : ''
        } else {
          inAmount = toTx.coinAmount.toDefaultNumber()
        }

        Object.assign(mergeObj, {
          inAmount,
          inCurrency,
          inTxId: toTx.txId,
          inTxUrl: toAsset.blockExplorer.txUrl(toTx.txId),
        })
      }

      if (toTxIndex !== -1) {
        const txLog = await this.#blockchainMetadata.getTxLog({
          assetName: order.fromAsset,
          walletAccount: mergeObj.fromPortfolio,
        })
        const fromTx = txLog.get(order.fromTxId)
        if (!fromTx) continue
        const fromAssetName = fromTx.coinName
        const fromAsset = this.#getAsset(fromAssetName)
        const outCurrency = fromAsset.displayTicker || fromAsset.ticker
        let outAmount
        if (ordersWithSameToTxId.length > 1) {
          outAmount = order.fromAmount ? order.fromAmount.toDefaultNumber() : ''
        } else {
          outAmount = fromTx.coinAmount.toDefaultNumber()
        }

        Object.assign(mergeObj, {
          outAmount,
          outCurrency,
          outTxId: fromTx.txId,
          outTxUrl: fromAsset.blockExplorer.txUrl(fromTx.txId),
          feeAmount: fromTx.feeAmount ? fromTx.feeAmount.negate().toDefaultNumber() : '',
          feeCurrency: fromTx.feeAmount ? fromTx.feeAmount.defaultUnit.unitName : '',
        })
      }

      if (fromTxIndex !== -1) {
        if (toTxIndex !== -1) {
          txIndexesToRemove.add(toTxIndex)
        }

        resultTxs[fromTxIndex] = { ...resultTxs[fromTxIndex], ...mergeObj }
      } else if (toTxIndex !== -1) {
        resultTxs[toTxIndex] = { ...resultTxs[toTxIndex], ...mergeObj }
      }
    }

    // Only remove the type:'deposit' tx once all exchanges that need its info for the previous step have been processed
    resultTxs = resultTxs.filter((_, index) => !txIndexesToRemove.has(index))

    return resultTxs
  }

  exportForWalletAccount = async (walletAccount) => {
    const personalNotes = await this.#personalNotesAtom.get()

    const txLogs = await this.#blockchainMetadata.getLoadedTxLogs()

    const txs = Object.values(get(txLogs, walletAccount)).flatMap((txLog) => [...txLog])

    txs.sort((a, b) => a.date - b.date)

    let exportedTxs = await Promise.all(
      txs.map((tx) => this.#prepareTxForExport({ tx, walletAccount, personalNotes }))
    )

    // // When tx.token is set, it is the 0 ETH tx corresponding to an outgoing ERC20 transfer. Exclude it.
    exportedTxs = exportedTxs.filter((tx) => tx.tokens.length === 0)

    exportedTxs = await this.#addOrderData(exportedTxs)

    return exportedTxs
  }

  getCSVExportFields = () => TX_EXPORT_FIELDS
}

export const create = (args) => new ExportTransactions(args)

const exportTransactionsDefinition = {
  id: 'exportTransactions',
  type: 'module',
  factory: create,
  dependencies: [
    'blockchainMetadata',
    'assetsModule',
    'enabledWalletAccountsAtom',
    'multipleWalletAccountsEnabledAtom',
    'personalNotesAtom',
    'ordersAtom',
  ],
  public: true,
}

export default exportTransactionsDefinition
