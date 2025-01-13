import awaitProxy from '@exodus/await-proxy'
import fusionModuleDefinition from './module/index.js'
import pDefer from 'p-defer'
import fusionLocalLifecyclePluginDefinition from './plugin/index.js'

const fusionUnlockDeferredDefinition = {
  type: 'module',
  id: 'fusionUnlockDeferred',
  factory: () => pDefer(),
  dependencies: [],
  public: true,
}

const migrateableFusionDefinition = {
  type: 'module',
  id: 'migrateableFusion',
  factory: ({ storage }) => fusionModuleDefinition.factory({ storage }),
  dependencies: ['storage'],
  public: true,
}

const fusionDefinition = {
  type: 'module',
  id: 'fusion',
  factory: ({ migrateableFusion, fusionUnlockDeferred }) =>
    awaitProxy({
      object: migrateableFusion,
      delayUntil: fusionUnlockDeferred.promise, // this is needed to be able to use fusion in migrations but avoid subscriptions (in fusion atoms for ex) to be called
      // HACK: subscribe not listed in synchronousMethods, since we want it to await fusionUnlockDeferred
      // subscribe doesn't return anything by default, so it's fine to silently make it async
      synchronousMethods: ['channel'],
      allowedMethods: ['clearStorage'],
    }),
  dependencies: ['migrateableFusion', 'fusionUnlockDeferred'],
  public: true,
}

const fusion = () => {
  return {
    id: 'fusion',
    definitions: [
      { definition: fusionUnlockDeferredDefinition },
      {
        definition: migrateableFusionDefinition,
        storage: { namespace: ['fusion', 'v1'] },
        aliases: [{ implementationId: 'migrateableStorage', interfaceId: 'storage' }],
      },
      { definition: fusionDefinition },
      { definition: fusionLocalLifecyclePluginDefinition },
    ],
  }
}

export default fusion
