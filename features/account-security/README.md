# @exodus/account-security

This Exodus SDK feature reports active account security warnings (`GLOBAL_SCAM` / `LOST_PERMISSIONS`) into the Safe Report.

These warnings already surface to users as modals in the desktop and mobile apps, but the Safe Report carried no record of them. When a user hits one and reaches out to support, there was previously no way to tell from the report which asset triggered the alert or which warning fired. This feature closes that gap.

## Install

```sh
pnpm add @exodus/account-security
```

## Usage

This feature is designed to be used together with `@exodus/headless`, where it is already wired in. See [using the sdk](../../docs/development/using-the-sdk.md).

It contributes a [`report` node](../../docs/development/dependency-injection.md) namespaced at `accountSecurity`, so its output shows up under that key whenever a Safe Report is assembled via `exodus.reporting.export()`. There is no `exodus.*` API surface, no atoms, and no plugin: the feature only reads existing state at report time.

## What it reports

At report time the feature walks the account states of every **enabled base asset**, runs that asset's `api.securityChecks({ accountState })`, and collects any account that comes back insecure.

The report is `null` when there is no wallet or the wallet is locked. Otherwise it has the shape:

```ts
{
  summary: {
    // The most severe active warning, or null when there are none.
    warningType: 'GLOBAL_SCAM' | 'LOST_PERMISSIONS' | null
    hasWarnings: boolean
  }
  // One entry per (wallet account, asset) that failed its security check.
  warnings: Array<{
    walletAccount: string
    assetName: string
    type: 'GLOBAL_SCAM' | 'LOST_PERMISSIONS'
    reason: string
  }>
  // One entry per base asset whose securityChecks method threw.
  checkFailures: Array<{
    walletAccount: string
    assetName: string
    error: SafeError
  }>
}
```

Example output:

```json
{
  "summary": { "warningType": "GLOBAL_SCAM", "hasWarnings": true },
  "warnings": [
    {
      "walletAccount": "exodus_0",
      "assetName": "tron",
      "type": "GLOBAL_SCAM",
      "reason": "Account is globally blacklisted."
    },
    {
      "walletAccount": "exodus_1",
      "assetName": "ethereum",
      "type": "LOST_PERMISSIONS",
      "reason": "Account is delegated to a non-whitelisted EIP-7702 address."
    }
  ],
  "checkFailures": []
}
```

### Severity precedence

`GLOBAL_SCAM` outranks `LOST_PERMISSIONS` because it can block the app at startup. When both kinds are present across accounts, `summary.warningType` reports `GLOBAL_SCAM`, while `warnings` still lists every individual warning regardless of type.

## How an asset opts in

This feature does not implement any detection logic itself, it only aggregates. The actual checks live in each asset's plugin, which exposes a synchronous `api.securityChecks` method:

```ts
asset.api.securityChecks({ accountState }): {
  isSecure: boolean
  type: 'GLOBAL_SCAM' | 'LOST_PERMISSIONS' | null
  reason: string | null
}
```

An account is only included in `warnings` when `isSecure` is `false`. To keep the report robust, the following are handled conservatively:

- **Tokens and non-base assets**: only base assets (where `asset.baseAsset.name === assetName`) are checked.
- **Assets without `securityChecks`**: assets that don't implement the method are ignored.
- **Disabled assets**: anything not enabled in `enabledAssetsAtom` is skipped.
- **Throwing checks**: if a single asset's `securityChecks` throws, the error is captured in `checkFailures` as a `SafeError` with the safe hint `account-security: report/security-checks`. The loop still continues, so one broken asset cannot sink the rest of the report.

## Dependencies

The report node depends on `assetsModule`, `accountStatesAtom`, and `enabledAssetsAtom`, all provided by the SDK.
