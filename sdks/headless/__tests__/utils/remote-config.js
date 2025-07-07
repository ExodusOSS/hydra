import EventEmitter from 'events/events.js'

export function createMockRemoteConfig({ container }) {
  let current = {}

  const emitter = new EventEmitter()
  const remoteConfig = Object.assign(emitter, {
    load: jest.fn(),
    stop: jest.fn(),
    getAll: async () => current,
    sync: () => emitter.emit('sync', { current }),
  })

  const mockConfig = (data) => {
    current = data
    emitter.emit('sync', { current: data })
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
