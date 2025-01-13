import { createInMemoryAtom } from '@exodus/atoms'

export const filesystemStatsAtomDefinition = {
  id: 'filesystemStatsAtom',
  type: 'atom',
  factory: () =>
    createInMemoryAtom({
      defaultValue: {
        totalSpace: null,
        freeSpace: null,
      },
    }),
  public: true,
}
