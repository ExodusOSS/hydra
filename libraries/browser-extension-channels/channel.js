class Channel {
  /* eslint-disable @exodus/mutable/no-param-reassign-prop-only */
  constructor({ name }) {
    this.name = name
  }

  #send = async (data, options, async) => {
    const { tabId, senderMetadata } = options || {}
    const message = { async, tabId, data, channel: this.name, senderMetadata }

    if (typeof tabId === 'number') {
      return chrome.tabs.sendMessage(tabId, message)
    }

    return chrome.runtime.sendMessage(message)
  }

  sendMessage = async (data, options) => {
    await this.#send(data, options, false)
  }

  call = async (data, options) => {
    const response = await this.#send(data, options, true)

    if (!response || !response.success)
      throw new Error(`Failed to call with: ${JSON.stringify(data)}`)

    return response.data
  }

  onMessage = (callback) => {
    const listener = (message, sender, sendResponse) => {
      if (message.async || message.channel !== this.name) return false

      try {
        sender.metadata = message.senderMetadata
        callback(message.data, sender)
      } catch (error) {
        console.error(error)
      }

      sendResponse({ success: true })
      return true
    }

    chrome.runtime.onMessage.addListener(listener)
  }

  onCall = (callback) => {
    const listener = (message, sender, sendResponse) => {
      const respond = (response) => {
        sendResponse({ success: true, data: response })
      }

      const handleMessage = async () => {
        try {
          sender.metadata = message.senderMetadata
          await callback(message.data, sender, respond)
        } catch {
          sendResponse({ success: false })
        }
      }

      if (message.async && this.name === message.channel) {
        handleMessage()
        return true
      }

      return false
    }

    chrome.runtime.onMessage.addListener(listener)
  }
}

export default Channel
