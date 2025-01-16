class MemoryStore {
  data = new Map()

  async set(obj) {
    const keys = Object.keys(obj)
    keys.forEach((key) => this.data.set(key, obj[key]))
  }

  async get(keys) {
    if (!keys) return Object.fromEntries(this.data)
    return Object.fromEntries(keys.map((key) => [key, this.data.get(key)]))
  }

  async remove(keys) {
    keys.forEach((key) => this.data.delete(key))
  }
}

export default MemoryStore
