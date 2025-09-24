import { mapValues, omit, pick, pickBy, memoize } from '@exodus/basic-utils'
import { z } from '@exodus/zod'

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
  export: async ({ walletExists, isLocked } = Object.create(null)) => {
    if (!walletExists || isLocked) return null

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
  getSchema: memoize(() => {
    const walletAccount = z.string()
    const assetName = z.string()
    const AddressMeta = z.record(z.string(), z.any())
    // Data can originally contain arbitrary fields,
    // but we've narrowed it down to only the specific properties requested by other teams for now.
    const dataObject = z
      .object({
        inputs: z
          .record(
            z.string(),
            z.object({
              address: z.string().nullish(),
              path: z.string().nullish(),
              utxos: z
                .array(
                  z.object({
                    script: z.string().nullish(),
                    txId: z.string().nullish(),
                    value: z.string().nullish(),
                    vout: z.number().nullish(),
                  })
                )
                .nullish(),
            })
          )
          .nullish(),
        sent: z
          .array(z.object({ address: z.string().nullish(), amount: z.string().nullish() }))
          .nullish(),
        rbfEnabled: z.boolean().nullish(),
      })
      .partial()
      .nullish()

    const sanitizedTxLogSchema = z.array(
      z
        .object({
          txId: z.string().nullish(),
          date: z.string().nullish(),
          confirmations: z.number().nullish(),
          from: z.array(z.string().nullish()),
          to: z.string().nullish(),
          dropped: z.boolean().nullish(),
          selfSend: z.boolean().nullish(),
          coinName: z.string().nullish(),
          coinAmount: z.string().nullish(),
          feeCoinName: z.string().nullish(),
          feeAmount: z.string().nullish(),
          addresses: z.array(
            z.object({ address: z.string(), meta: AddressMeta }).strict().partial()
          ),
          tokens: z.array(z.string()).nullish(),
          token: z.any().nullish(),
          currencies: z.array(z.string()).nullish(),
          version: z.number().nullish(),
          data: dataObject,

          // Private Assets only.
          send: z.boolean().nullish(),
        })
        .strict()
        .partial()
    )
    const txLogsSchema = z.record(walletAccount, z.record(assetName, sanitizedTxLogSchema))

    const sanitizedValueSchema = z.union([z.number(), z.boolean(), z.string()]).nullish()

    const accountStateSchema = z.record(
      z.string(),
      z.union([sanitizedValueSchema, z.record(z.string(), sanitizedValueSchema)]).optional()
    )
    const sanitizedAccountStateSchema = z.union([
      // Not an actual error, see the `sanitizeAccountState` function above.
      z.object({ error: z.string() }).strict(),
      accountStateSchema,
    ])

    const accountStatesSchema = z.record(
      walletAccount,
      z.record(assetName, sanitizedAccountStateSchema)
    )

    return z
      .object({
        earliestTxDate: z.string().optional(),
        txLogs: txLogsSchema,
        accountStates: accountStatesSchema,
      })
      .strict()
      .nullable()
  }),
})

const blockchainMetadataReportDefinition = {
  id: 'blockchainMetadataReport',
  type: 'report',
  factory: createblockchainMetadataReport,
  dependencies: ['txLogsAtom', 'accountStatesAtom', 'enabledAssetsAtom', 'earliestTxDateAtom'],
  public: true,
}

export default blockchainMetadataReportDefinition
