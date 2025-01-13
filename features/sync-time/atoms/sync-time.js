import { createInMemoryAtom } from '@exodus/atoms'

const syncTimeAtomDefinition = {
  id: 'syncTimeAtom',
  type: 'atom',
  factory: ({ synchronizedTime }) =>
    createInMemoryAtom({
      defaultValue: {
        time: synchronizedTime.now(),
        startOfHour: new Date(synchronizedTime.now()).setMinutes(0, 0, 0).valueOf(),
      },
    }),
  dependencies: ['synchronizedTime'],
  public: true,
}

export default syncTimeAtomDefinition
