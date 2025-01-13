// eslint-disable-next-line @exodus/restricted-imports/no-node-core-events
import { EventEmitter } from 'events'

class ApplicationMock extends EventEmitter {
  #hooks = []

  fire = async (hookName, params) => {
    const hooks = this.#hooks[hookName] || []

    for (const hook of hooks) {
      await hook(params)
    }

    this.emit(hookName, params)
  }

  hook = (hookName, listener) => {
    if (!this.#hooks[hookName]) {
      this.#hooks[hookName] = []
    }

    this.#hooks[hookName].push(listener)
  }

  reset = () => {
    this.#hooks = []
  }
}

export default ApplicationMock
