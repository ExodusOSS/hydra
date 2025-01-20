import { WalletAccount } from '@exodus/models'

import adapters from '../background/adapters/index.js'
import config from '../background/config.js'
import createSDK from '../background/exodus.js'
import { connectThreads } from './multi-process.js'
import setupBG from './setup-bg.js'
import setupUI from './setup-ui.js'

const mnemonic = 'menu memory fury language physical wonder dog valid smart edge decrease worth'
const passphrase = 'abracadabra'

// Single process:
// If you don't need the UI and you're running in a single process, this is all you need!
test("it's alive!", async () => {
  const sdk = createSDK({ adapters, config, debug: false })
  expect(sdk).toBeDefined()

  await sdk.application.start()
  await sdk.application.load()
  await sdk.application.import({ mnemonic, passphrase })
  await sdk.application.unlock({ passphrase })

  const { address: ethAddress } = await sdk.addressProvider.getDefaultAddress({
    walletAccount: WalletAccount.DEFAULT_NAME,
    assetName: 'ethereum',
  })

  expect(ethAddress).toEqual('0xF3d46F0De925B28fDa1219BbD60F5ae2a0128F9F')
})

// Multi-process:
// We simulate a background thread and a UI thread, connected via onmessage/postMessage to each other
test('to the UI and back', async () => {
  const { thread: bgThread } = setupBG()
  const { sdkRPC, selectors, store, thread: uiThread } = setupUI()

  // simulate the threads being connected postMessage <-> onmessage
  connectThreads(bgThread, uiThread)

  // THE REST OF THIS CODE IS FROM THE PERSPECTIVE OF THE UI THREAD

  await sdkRPC.application.start()
  await sdkRPC.application.load()
  await sdkRPC.application.import({ mnemonic, passphrase })
  await sdkRPC.application.unlock({ passphrase })

  const { address: ethAddress } = await sdkRPC.addressProvider.getDefaultAddress({
    walletAccount: WalletAccount.DEFAULT_NAME,
    assetName: 'ethereum',
  })

  expect(ethAddress).toEqual('0xF3d46F0De925B28fDa1219BbD60F5ae2a0128F9F')

  const isAssetEnabled = (assetName: string) =>
    selectors.enabledAssets.getIsEnabled(store.getState())(assetName)
  const isEthereumEnabled = () => isAssetEnabled('ethereum')
  const isUSDCEnabled = () => isAssetEnabled('usdcoin')

  // await awaitState(store, isEthereumEnabled)
  expect(isEthereumEnabled()).toEqual(true)
  expect(isUSDCEnabled()).toEqual(false)
  await sdkRPC.assets.enable(['usdcoin'])
  await new Promise(setImmediate)
  expect(isUSDCEnabled()).toEqual(true)

  await sdkRPC.application.stop()
})
