import EventEmitter from 'eventemitter3'

class PortTransport extends EventEmitter {
  constructor({ port }) {
    super()

    this.port = port
  }

  write(data) {
    this.port.postMessage(data)
  }

  on(eventName, listener) {
    super.on(eventName, listener)

    if (eventName === 'data') {
      this.port.onMessage.addListener(listener)
    }
  }

  removeListener(eventName, listener) {
    super.removeListener(eventName, listener)

    if (eventName === 'data') {
      this.port.onMessage.removeListener(listener)
    }
  }
}

export default PortTransport
