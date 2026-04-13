import { createInMemoryAtom, compute } from '@exodus/atoms'
import { createFusionAtom } from '@exodus/fusion-atoms'

export const accountStatesAtomDefinition = {
  id: 'accountStatesAtom',
  type: 'atom',
  factory: ({ blockchainMetadataAtom }) =>
    compute({
      atom: blockchainMetadataAtom,
      selector: ({ value, accountStateChanges }) => ({
        value: value.accountStates,
        changes: accountStateChanges,
      }),
    }),
  dependencies: ['blockchainMetadataAtom'],
  public: true,
}

export const txLogsAtomDefinition = {
  id: 'txLogsAtom',
  type: 'atom',
  factory: ({ blockchainMetadataAtom }) =>
    compute({
      atom: blockchainMetadataAtom,
      selector: ({ value, txLogChanges, newlyReceivedTxLogs }) => ({
        value: value.txs,
        changes: txLogChanges,
        newlyReceivedTxLogs,
      }),
    }),
  dependencies: ['blockchainMetadataAtom'],
  public: true,
}

export const blockchainMetadataAtomDefinition = {
  id: 'blockchainMetadataAtom',
  type: 'atom',
  factory: () => createInMemoryAtom(), // eslint-disable-line @exodus/hydra/in-memory-atom-default-value
  dependencies: [],
  public: true,
}

export const earliestTxDateAtom = {
  id: 'earliestTxDateAtom',
  type: 'atom',
  factory: ({ fusion, logger }) => createFusionAtom({ fusion, logger, path: 'earliestTxDate' }),
  dependencies: ['fusion', 'logger'],
  public: true,
}
