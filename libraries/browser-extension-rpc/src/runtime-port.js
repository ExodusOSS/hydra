class RuntimePort {
  constructor({ name }) {
    this.name = name
    this.port = null
    this.connected = null
    this.listeners = []

    this.#connect()
  }

  #connect = () => {
    let _resolve

    this.connected = new Promise((resolve) => (_resolve = resolve))

    this.listeners.forEach((listener) => this.port.onMessage.removeListener(listener))

    this.port = chrome.runtime.connect({ name: this.name })
    this.port.onDisconnect.addListener(() => this.#connect())

    this.listeners.forEach((listener) => this.port.onMessage.addListener(listener))

    _resolve()
  }

  #addListener = (listener) => {
    this.listeners.push(listener)
    this.port.onMessage.addListener(listener)
  }

  #removeListener = (listener) => {
    const index = this.listeners.indexOf(listener)

    if (index >= 0) {
      this.listeners.splice(index, 1)
      this.port.onMessage.removeListener(listener)
    }
  }

  get onMessage() {
    return {
      addListener: this.#addListener,
      removeListener: this.#removeListener,
    }
  }

  postMessage = (event) => {
    this.connected.then(() => this.port.postMessage(event))
  }
}

export default RuntimePort
