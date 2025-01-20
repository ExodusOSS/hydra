// this one is not actually browser-extension specific
import { createRpcClient } from '@exodus/browser-extension-rpc'
import createReduxIOC from '@exodus/headless/redux'

import { createProcessRPC, Thread } from './multi-process'

const setupUI = () => {
  const reduxIoc = createReduxIOC({
    actionCreators: {},
    reducers: {},
  })

  const { handleEvent, selectors, store } = reduxIoc.resolve()

  const thread = new Thread()
  const { transport, rpc } = createProcessRPC(thread)
  transport.on('data', (data) => {
    const { method, params } = data
    handleEvent(method, params)
  })

  const sdkRPC = createRpcClient(rpc)
  return { selectors: selectors as any, store, sdkRPC, thread }
}

export default setupUI
