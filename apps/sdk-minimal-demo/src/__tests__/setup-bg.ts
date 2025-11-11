import adapters from '../background/adapters/index'
import config from '../background/config'
import createSDK from '../background/exodus'
import { createProcessRPC, Thread } from './multi-process'

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
