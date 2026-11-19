import { combine } from '@exodus/atoms'

// oxlint-disable-next-line @exodus/oxlint-plugin-hydra/export-default-named
export default {
  id: 'featureFlagsAtom',
  type: 'atom',
  dependencies: ['featureFlagAtoms'],
  factory: ({ featureFlagAtoms }) => combine(featureFlagAtoms),
  public: true,
}
