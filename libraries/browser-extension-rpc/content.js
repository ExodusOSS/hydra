import channels from '@exodus/browser-extension-channels'
import { createWindowRpcTransport } from '@exodus/window-rpc-transport'

import { getIcon, getTitle } from './src/metadata.js'

const metadata = new Promise((resolve) => {
  window.addEventListener('load', async () => {
    const title = getTitle()
    const icon = await getIcon()
    resolve({ title, icon })
  })
})

export const createRPCProxy = ({ extensionName, channelName }) => {
  if (typeof extensionName !== 'string' || typeof channelName !== 'string') {
    throw new TypeError(`Unable to create RPC because channelName or extensionName are missing`)
  }

  const channel = channels[channelName]
  const transport = createWindowRpcTransport({
    name: `${extensionName}-${channelName}`,
    target: `${extensionName}-${channelName}-window`,
  })

  transport.on('data', async (event) => {
    const isResponse = !JSON.parse(event).method
    const senderMetadata = await metadata
    const options = { senderMetadata }

    if (isResponse) {
      channel.sendMessage(event, options)
    } else {
      channel.call(event, options).then(transport.write)
    }
  })

  channel.onMessage((message, sender) => {
    if (sender.tab) return
    transport.write(message)
  })
}
