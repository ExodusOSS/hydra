import {
  availableAssetNamesAtomDefinition,
  availableAssetsAtomDefinition,
} from '@exodus/available-assets/atoms/index.js'
import createIOC from '@exodus/dependency-injection'
import preprocess from '@exodus/dependency-preprocessors'
import logify from '@exodus/dependency-preprocessors/src/preprocessors/logify.js'
import createInMemoryStorage from '@exodus/storage-memory'

import { enabledAndDisabledAssetsAtomDefinition, enabledAssetsAtomDefinition } from '../index.js'

const createLogger =
  (namespace) =>
  (...args) =>
    console(namespace, ...args)

const setup = () => {
  const logger = console
  const ioc = createIOC({ logger })
  const deps = preprocess({
    dependencies: [
      {
        id: 'logger',
        factory: () => console,
        public: true,
      },
      {
        id: 'storage',
        factory: createInMemoryStorage,
        public: true,
      },
      {
        id: 'config',
        factory: () => ({ defaultAvailableAssetNames: ['bitcoin', 'ethereum'] }),
        public: true,
      },
      enabledAndDisabledAssetsAtomDefinition,
      enabledAssetsAtomDefinition,
      availableAssetNamesAtomDefinition,
      availableAssetsAtomDefinition,
    ].map((definition) => ({ definition })),
    preprocessors: [logify({ createLogger })],
  })

  ioc.registerMultiple(deps)
  ioc.resolve()
  return ioc.getAll()
}

describe('atoms', () => {
  describe('enabledAndDisabledAssetsAtom', () => {
    let enabledAndDisabledAssetsAtom
    let enabledAssetsAtom
    let availableAssetsAtom

    beforeEach(() => {
      ;({ enabledAndDisabledAssetsAtom, enabledAssetsAtom, availableAssetsAtom } = setup())
    })

    describe('enabledAndDisabledAssetsAtom', () => {
      it('defaults to nothing disabled', async () => {
        expect(await enabledAndDisabledAssetsAtom.get()).toEqual({
          disabled: {},
        })
      })

      it('accepts updates', async () => {
        const update = {
          disabled: {
            bitcoin: true,
            ethereum: false,
          },
        }

        await enabledAndDisabledAssetsAtom.set(update)
        expect(await enabledAndDisabledAssetsAtom.get()).toEqual(update)
      })
    })

    describe('enabledAssetsAtom', () => {
      it('defaults to everything implicitly enabled', async () => {
        await availableAssetsAtom.set([{}])
        expect(await enabledAssetsAtom.get()).toEqual({})
      })

      it('accepts updates via enabledAndDisabledAssetsAtom and returns only available assets', async () => {
        const update = {
          disabled: {
            bitcoin: true,
            ethereum: false,
            solana: true,
          },
        }

        await enabledAndDisabledAssetsAtom.set(update)
        await availableAssetsAtom.set(
          ['bitcoin', 'ethereum'].map((assetName) => ({ assetName, reason: 'assets-load' }))
        )
        expect(await enabledAssetsAtom.get()).toEqual({
          ethereum: true,
        })
      })
    })
  })
})
