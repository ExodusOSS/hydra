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
  // oxlint-disable-next-line @exodus/oxlint-plugin-hydra/in-memory-atom-default-value
  factory: () => createInMemoryAtom(),
}

export const unsafeRemoteErrorTrackingEnabledAtomDefinition = {
  id: 'unsafeRemoteErrorTrackingEnabledAtom',
  type: 'atom',
  // oxlint-disable-next-line @exodus/oxlint-plugin-hydra/in-memory-atom-default-value
  factory: () => createInMemoryAtom(),
}
