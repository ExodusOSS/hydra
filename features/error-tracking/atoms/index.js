import { createInMemoryAtom } from '@exodus/atoms'

/* errorsAtom schema:
  {
    errors: [{ `namespace`, `error`, `context`, `time` }, ...]
  }
*/
export const errorsAtomDefinition = {
  id: 'errorsAtom',
  type: 'atom',
  factory: () => createInMemoryAtom({ defaultValue: { errors: [] } }),
  dependencies: [],
}

export const remoteErrorTrackingEnabledAtomDefinition = {
  id: 'remoteErrorTrackingEnabledAtom',
  type: 'atom',
  // eslint-disable-next-line @exodus/hydra/in-memory-atom-default-value
  factory: () => createInMemoryAtom(),
}
