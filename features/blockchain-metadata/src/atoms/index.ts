import type { Definition } from '@exodus/dependency-types'
import { createInMemoryAtom, compute } from '@exodus/atoms'
import { createFusionAtom } from '@exodus/fusion-atoms'
import type {
  AccountStatesAtomValue,
  BlockchainMetadataAtom,
  BlockchainMetadataAtomValue,
  Fusion,
  TxLogsAtomValue,
} from '../types.js'

export interface BlockchainMetadataAtomDependencies {
  blockchainMetadataAtom: BlockchainMetadataAtom
}

export interface EarliestTxDateDependencies {
  fusion: Fusion
}

export const accountStatesAtomDefinition = {
  id: 'accountStatesAtom',
  type: 'atom',
  factory: ({ blockchainMetadataAtom }: BlockchainMetadataAtomDependencies) =>
    compute<BlockchainMetadataAtomValue, AccountStatesAtomValue>({
      atom: blockchainMetadataAtom,
      selector: ({ value, accountStateChanges }) => ({
        value: value.accountStates,
        changes: accountStateChanges,
      }),
    }),
  dependencies: ['blockchainMetadataAtom'] as const,
  public: true,
} as const satisfies Definition

export const txLogsAtomDefinition = {
  id: 'txLogsAtom',
  type: 'atom',
  factory: ({ blockchainMetadataAtom }: BlockchainMetadataAtomDependencies) =>
    compute<BlockchainMetadataAtomValue, TxLogsAtomValue>({
      atom: blockchainMetadataAtom,
      selector: ({ value, txLogChanges, newlyReceivedTxLogs }) => ({
        value: value.txs,
        changes: txLogChanges,
        newlyReceivedTxLogs,
      }),
    }),
  dependencies: ['blockchainMetadataAtom'] as const,
  public: true,
} as const satisfies Definition

export const blockchainMetadataAtomDefinition = {
  id: 'blockchainMetadataAtom',
  type: 'atom',
  factory: () => createInMemoryAtom<BlockchainMetadataAtomValue>(), // oxlint-disable-line @exodus/oxlint-plugin-hydra/in-memory-atom-default-value
  dependencies: [] as const,
  public: true,
} as const satisfies Definition

export const earliestTxDateAtom = {
  id: 'earliestTxDateAtom',
  type: 'atom',
  factory: ({ fusion }: EarliestTxDateDependencies) =>
    createFusionAtom<string | undefined>({ fusion, path: 'earliestTxDate' }),
  dependencies: ['fusion'] as const,
  public: true,
} as const satisfies Definition
