import { combine } from '@exodus/atoms'

// eslint-disable-next-line @exodus/export-default/named
export default {
  id: 'featureFlagsAtom',
  type: 'atom',
  dependencies: ['featureFlagAtoms'],
  factory: ({ featureFlagAtoms }) => combine(featureFlagAtoms),
  public: true,
}
