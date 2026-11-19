import { createRemoteConfigAtomFactory } from '@exodus/remote-config-atoms'

import createRestoringAssetsAtom from './restoring-assets.js'

export const assetsConfigAtomDefinition = {
  id: 'assetsConfigAtom',
  type: 'atom',
  factory: ({ remoteConfig }) =>
    createRemoteConfigAtomFactory({ remoteConfig })({
      path: 'assets',
      defaultValue: Object.create(null),
    }),
  dependencies: ['remoteConfig'],
  public: true,
}

export const restoringAssetsAtomDefinition = {
  id: 'restoringAssetsAtom',
  type: 'atom',
  factory: createRestoringAssetsAtom,
  dependencies: ['storage'],
  public: true,
}
