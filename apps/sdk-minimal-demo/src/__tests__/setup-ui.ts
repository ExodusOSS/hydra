import createReduxIOC from '@exodus/headless/redux'
import { createRPCClient } from '@exodus/sdk-rpc'

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

  const sdkRPC = createRPCClient(rpc)
  return { selectors: selectors as any, store, sdkRPC, thread }
}

export default setupUI
