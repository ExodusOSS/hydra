import type { Feature } from '@exodus/dependency-types'
import createIOC from '../index.js'

const feature = () =>
  ({
    id: 'assets',
    definitions: [
      {
        definition: {
          id: 'assetsApi',
          type: 'api',
          factory: () => ({
            assets: {
              getAsset: (name: string) => name,
              getAssets: () => ({ bitcoin: { name: 'bitcoin' }, ethereum: { name: 'ethereum' } }),
            },
          }),
        },
      },
      {
        definition: {
          id: 'assetsModule',
          type: 'module',
          factory: () => 42,
          public: true,
        },
      },
    ],
  }) as const satisfies Feature

const someCrap: any = 'any'

const ioc = createIOC({ adapters: {} }) //
  .use(feature())
  .use(someCrap)

const { assets } = ioc.get('assetsApi')
assets.getAsset('ethereum')
assets.getAssets()

// @ts-expect-error This fails, assetsModule is not of type api
const { assetsModule } = ioc.getByType('api')

const { assetsModule: _ } = ioc.getByType('module')

// @ts-expect-error This fails, test doesn't exist
ioc.get('test')

const definitions = [
  {
    definition: {
      id: 'identity',
      factory: () => 'Bruce Wayne',
      public: true,
    },
  },
] as const
ioc.registerMultiple(definitions) // can register non feature node without type

const wayneFeature: Feature = {
  id: 'wayne',
  // @ts-expect-error This fails, missing type
  definitions,
}

// supports definition with preprocessor config
const arkhamFeature: Feature = {
  id: 'arkham',
  definitions: [
    {
      definition: {
        id: 'identity',
        type: 'module',
        factory: () => 'Joker',
        public: true,
      },
      storage: {
        namespace: 'villains',
      },
      foes: ['Batman'],
    },
  ],
}
