import { memoize } from '@exodus/basic-utils'
import { SafeError } from '@exodus/errors'
import { safeString } from '@exodus/safe-string'
import { z } from '@exodus/zod'

const GLOBAL_SCAM = 'GLOBAL_SCAM'
const LOST_PERMISSIONS = 'LOST_PERMISSIONS'
const WARNING_TYPES = new Set([GLOBAL_SCAM, LOST_PERMISSIONS])

// GLOBAL_SCAM is the higher-severity warning (it can block the app at startup),
// so it wins when warnings of both kinds are present.
const resolveWarningType = (warnings) => {
  const types = new Set(warnings.map((warning) => warning.type))
  if (types.has(GLOBAL_SCAM)) return GLOBAL_SCAM
  if (types.has(LOST_PERMISSIONS)) return LOST_PERMISSIONS
  return null
}

const SECURITY_CHECKS_FAILURE_HINT = safeString`account-security: report/security-checks`

const toSafeError = (error) => {
  if (error instanceof Error) {
    Object.assign(error, { hint: SECURITY_CHECKS_FAILURE_HINT })
    return SafeError.from(error)
  }

  return SafeError.from(new Error(SECURITY_CHECKS_FAILURE_HINT))
}

const isWarningResult = (result) =>
  result?.isSecure === false && WARNING_TYPES.has(result.type) && typeof result.reason === 'string'

const createAccountSecurityReport = ({ assetsModule, accountStatesAtom, enabledAssetsAtom }) => ({
  namespace: 'accountSecurity',
  export: async ({ walletExists, isLocked } = Object.create(null)) => {
    if (!walletExists || isLocked) return null

    const [{ value: accountStates }, enabledAssets] = await Promise.all([
      accountStatesAtom.get(),
      enabledAssetsAtom.get(),
    ])

    const assets = assetsModule.getAssets()
    const enabledAssetNames = new Set(
      Object.keys(enabledAssets).filter((assetName) => enabledAssets[assetName])
    )

    const warnings = []
    const checkFailures = []
    for (const [walletAccount, accountStateByAsset] of Object.entries(accountStates ?? {})) {
      for (const [assetName, accountState] of Object.entries(accountStateByAsset ?? {})) {
        if (!enabledAssetNames.has(assetName)) continue

        const asset = assets[assetName]
        // Only base assets expose securityChecks; skip tokens and unknown assets.
        if (asset?.baseAsset?.name !== assetName) continue
        if (typeof asset.api?.securityChecks !== 'function') continue

        try {
          const result = asset.api.securityChecks({ accountState })
          if (isWarningResult(result)) {
            const { type, reason } = result
            warnings.push({ walletAccount, assetName, type, reason })
          } else if (result?.isSecure !== true) {
            checkFailures.push({ walletAccount, assetName, error: toSafeError() })
          }
        } catch (error) {
          // A single misbehaving asset must never sink the whole report.
          checkFailures.push({ walletAccount, assetName, error: toSafeError(error) })
        }
      }
    }

    return {
      summary: { warningType: resolveWarningType(warnings), hasWarnings: warnings.length > 0 },
      warnings,
      checkFailures,
    }
  },
  getSchema: memoize(() =>
    z
      .object({
        summary: z
          .object({
            warningType: z.enum([GLOBAL_SCAM, LOST_PERMISSIONS]).nullable(),
            hasWarnings: z.boolean(),
          })
          .strict(),
        warnings: z.array(
          z
            .object({
              walletAccount: z.string(),
              assetName: z.string(),
              type: z.enum([GLOBAL_SCAM, LOST_PERMISSIONS]),
              reason: z.string(),
            })
            .strict()
        ),
        checkFailures: z.array(
          z
            .object({
              walletAccount: z.string(),
              assetName: z.string(),
              error: z.instanceof(SafeError),
            })
            .strict()
        ),
      })
      .strict()
      .nullable()
  ),
})

const accountSecurityReportDefinition = {
  id: 'accountSecurityReport',
  type: 'report',
  factory: createAccountSecurityReport,
  dependencies: ['assetsModule', 'accountStatesAtom', 'enabledAssetsAtom'],
  public: true,
}

export default accountSecurityReportDefinition
