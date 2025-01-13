import { createRemoteConfigAtomFactory } from '@exodus/remote-config-atoms'

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
