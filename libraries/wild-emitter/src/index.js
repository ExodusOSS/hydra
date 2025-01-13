class Emitter {
  #listeners = []

  emit(type, payload) {
    this.#listeners.forEach((fn) => fn({ type, payload }))
  }

  subscribe(fn) {
    this.#listeners.push(fn)
  }

  unsubscribe(fn) {
    const index = this.#listeners.indexOf(fn)
    if (index !== -1) {
      this.#listeners.splice(index, 1)
    }
  }
}

export default Emitter
