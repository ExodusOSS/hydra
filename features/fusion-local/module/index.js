import fusionMerge from '@exodus/fusion-merge'
import { createStorageAtomFactory } from '@exodus/atoms'

const MODULE_ID = 'fusion'

class FusionLocal {
  #storageAtom
  #subscriptions

  constructor({ storage }) {
    this.#storageAtom = createStorageAtomFactory({ storage })({
      key: 'profile',
      isSoleWriter: true,
      defaultValue: { private: {} },
    })
    this.#subscriptions = []
  }

  load = async () => {}
  logout = async () => {}
  getProfile = async () => this.#storageAtom.get()
  mergeProfile = async (obj) => {
    const newProfile = fusionMerge(await this.getProfile(), obj)
    // handling subscriptions before setting to storage, to remove the possibility of concurrency bugs
    try {
      this.#subscriptions.forEach((subscription) => subscription(newProfile))
    } finally {
      // finally block, just in case a subscription throws
      await this.#storageAtom.set(newProfile)
    }
  }

  subscribe = (callback) => {
    this.#subscriptions.push(callback)
  }

  channel = () => {
    return {
      push: async () => {},
      awaitProcessed: async () => {},
    }
  }

  recordLogin = async () => {}

  clearStorage = async () => {
    return this.#storageAtom.set(undefined)
  }
}

const createFusionLocal = (opts) => new FusionLocal(opts)

const fusionLocalDefinition = {
  id: MODULE_ID,
  type: 'adapter',
  factory: createFusionLocal,
  dependencies: ['storage'],
  public: true,
}

export default fusionLocalDefinition
