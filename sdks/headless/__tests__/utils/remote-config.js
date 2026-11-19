import { createInMemoryAtom } from '@exodus/atoms'

export function createMockRemoteConfig({ container }) {
  let current = {}

  const remoteConfigAtom = createInMemoryAtom({ defaultValue: current })
  const remoteConfig = {
    load: jest.fn(),
    stop: jest.fn(),
    getAll: async () => current,
    remoteConfigAtom,
  }

  const mockConfig = (data) => {
    current = data
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
