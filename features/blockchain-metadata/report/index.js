import { mapValues, omit, pick, pickBy } from '@exodus/basic-utils'

const privateAssets = new Set(['monero'])

const sanitizeTxLog = (txLog) =>
  [...txLog]
    .reverse()
    // sort newest to the top
    .map((tx) =>
      privateAssets.has(tx.coinName)
        ? { coinName: tx.coinName, send: tx.sent }
        : omit(tx.toRedactedJSON(), ['currencies'])
    )

const sanitizeAccountState = ({ accountState, assetName }) => {
  if (typeof accountState?.toRedactedJSON !== 'function') {
    return {
      error: `AccountState class for asset "${assetName}" is missing a toRedactedJSON method`,
    }
  }

  const { _version, ...redacted } = accountState.toRedactedJSON()
  return redacted
}

const createblockchainMetadataReport = ({
  txLogsAtom,
  accountStatesAtom,
  enabledAssetsAtom,
  earliestTxDateAtom,
}) => ({
  namespace: 'blockchainMetadata',
  export: async ({ walletExists } = Object.create(null)) => {
    if (!walletExists) return null

    const [{ value: txLogs }, { value: accountStates }] = await Promise.all([
      txLogsAtom.get(),
      accountStatesAtom.get(),
    ])

    const [enabledAssets, earliestTxDate] = await Promise.all([
      enabledAssetsAtom.get(),
      earliestTxDateAtom.get(),
    ])

    const enabledAssetNames = Object.keys(enabledAssets)
    return {
      earliestTxDate,
      txLogs: mapValues(txLogs, (byAsset) =>
        // omit empty
        pickBy(mapValues(byAsset, sanitizeTxLog), (txs) => txs?.length)
      ),
      accountStates: mapValues(accountStates, (byAsset) => {
        // should we omit privateAssets entirely?
        const enabled = pick(byAsset, enabledAssetNames)
        return mapValues(enabled, (accountState, assetName) =>
          sanitizeAccountState({ accountState, assetName })
        )
      }),
    }
  },
})

const blockchainMetadataReportDefinition = {
  id: 'blockchainMetadataReport',
  type: 'report',
  factory: createblockchainMetadataReport,
  dependencies: ['txLogsAtom', 'accountStatesAtom', 'enabledAssetsAtom', 'earliestTxDateAtom'],
  public: true,
}

export default blockchainMetadataReportDefinition
