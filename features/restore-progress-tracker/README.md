# @exodus/restore-progress-tracker

module subscribes to monitors when created.

`restoreAll`: should be called on client side during restore. it adds all available restoring assets and their tokens to `restoringAssetsAtom`.
once monitor ticked remove them and their tokens from atom
`restoreAsset`: can be called at any time. for example EOS|HEDERA account reset. adds asset to `restoringAssetAtom` and waits monitor tick

## Config

`config.monitorEvents` by default listen 2 monitor events: `after-tick-multiple-wallet-accounts`, `after-restore`.
Usually we assume that asset is restored after `after-tick-multiple-wallet-accounts`, but some assets like monero emit own event `after-restore` at specific time.

`config.assetNamesToNotWait`: by default `['monero']`. we don't wait till monero restored to mark wallet as restored.

## Usage

See [examples](./module/__tests__/index.test.js).
