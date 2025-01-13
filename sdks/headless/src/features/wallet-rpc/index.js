import { createInMemoryAtom } from '@exodus/atoms'

const walletRpc = (api) => {
  const id = 'wallet'

  const createSeedIngestingProxy = (primarySeedIdAtom) =>
    new Proxy(api, {
      get(target, prop) {
        if (prop === 'unlock') {
          return async (...args) => {
            const { primarySeedId } = await target[prop](...args)
            await primarySeedIdAtom.set(primarySeedId)
            return primarySeedId
          }
        }

        return target[prop]
      },
    })

  return {
    id,
    definitions: [
      {
        definition: {
          id: 'primarySeedIdAtom',
          type: 'atom',
          factory: () => createInMemoryAtom(), // eslint-disable-line @exodus/hydra/in-memory-atom-default-value
          public: true,
        },
      },
      {
        definition: {
          id,
          type: 'module',
          public: true,
          factory: ({ primarySeedIdAtom }) => createSeedIngestingProxy(primarySeedIdAtom),
          dependencies: ['primarySeedIdAtom'],
        },
      },
      {
        definition: {
          id: `${id}Api`,
          type: 'api',
          factory: ({ primarySeedIdAtom }) => ({
            [id]: createSeedIngestingProxy(primarySeedIdAtom),
          }),
          dependencies: ['primarySeedIdAtom'],
        },
      },
    ],
  }
}

export default walletRpc
