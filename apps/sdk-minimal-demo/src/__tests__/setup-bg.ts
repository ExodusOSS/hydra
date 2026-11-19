import adapters from '../background/adapters/index.js'
import baseConfig from '../background/config.js'
import createSDK from '../background/exodus.js'
import { createProcessRPC, Thread } from './multi-process.js'

// In production, `usdcoin` is added to availableAssets when the remote-config
// network call succeeds and emits an `assets-update`. The integration test's
// "to the UI and back" assertion exercises `assets.enable(['usdcoin'])`, so it
// depends on that side-effect — which makes the test flaky whenever the
// real `https://remote-config.exodus.io` endpoint is slow or returns a
// transient error during CI. Override `defaultAvailableAssetNames` here so
// the test has a deterministic set of available assets and never blocks on
// a real HTTP request to populate them.
//
// Evidence of the flake (timing out at 30s waiting for the `enabledAssets`
// event because `usdcoin` was never added to availableAssets):
// - master:                            https://github.com/exodus/wallet-sdk-monorepo/actions/runs/25479358016
// - PR chore/audit-codeowners-script:  https://github.com/exodus/wallet-sdk-monorepo/actions/runs/25457763260
const config = {
  ...baseConfig,
  availableAssets: {
    ...baseConfig.availableAssets,
    defaultAvailableAssetNames: [
      ...baseConfig.availableAssets.defaultAvailableAssetNames,
      'usdcoin',
    ],
  },
}

const setupBG = () => {
  const sdk = createSDK({ adapters, config, debug: false })
  const thread = new Thread()
  const { rpc } = createProcessRPC(thread)
  // this deep-traverses the SDK object and exposes all APIs from 'api' nodes
  rpc.exposeMethods(sdk)
  // when the SDK emits an event, broadcast it over RPC to the UI thread
  sdk.subscribe(({ type, payload }: { type: string; payload: any }) => rpc.notify(type, payload))
  return { sdk, thread }
}

export default setupBG
