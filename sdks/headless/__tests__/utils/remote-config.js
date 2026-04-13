import { createInMemoryAtom } from '@exodus/atoms'
import EventEmitter from 'events/events.js'

export function createMockRemoteConfig({ container }) {
  let current = {}

  const remoteConfigAtom = createInMemoryAtom({ defaultValue: {} })
  const emitter = new EventEmitter()
  const remoteConfig = Object.assign(emitter, {
    load: jest.fn(),
    stop: jest.fn(),
    getAll: async () => current,
    sync: () => emitter.emit('sync', { current }),
    remoteConfigAtom,
  })

  const mockConfig = (data) => {
    current = data
    emitter.emit('sync', { current: data })
    remoteConfigAtom.set({ config: data })
  }

  container.register({
    definition: {
      id: 'remoteConfig',
      factory: () => remoteConfig,
      override: true,
      public: true,
    },
  })

  return { mockConfig }
}
