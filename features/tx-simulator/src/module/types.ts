import type {
  EthAggregatedTransactionSimulationResult,
  EthSimulateTransactionParams,
} from '@exodus/web3-ethereum-utils'
import type { SolAggregatedTransactionSimulationResult } from '@exodus/web3-solana-utils/lib'
import type { AssetBase } from '@exodus/exchange-client-providers/lib/services/assets/types'
import type { AssetClientInterface } from '@exodus/web3-types'

export type AssetsModule = {
  getAsset: (assetName: string) => AssetBase
}

export type Config = {
  apiUrl?: string
}

export type Logger = {
  warn: (message: string) => void
}

export type TxSimulatorConstructor = {
  assetsModule: AssetsModule
  logger: Logger
  assetClientInterface: AssetClientInterface
  config?: Config
}

export type SimulateParams = {
  assetName: string
} & (
  | EthSimulateTransactionParams
  | Pick<
      SolSimulateTransactionParams,
      'origin' | 'overrideApiEndpoint' | 'senderAddress' | 'transactions'
    >
)

export type SimulateResponse =
  | EthAggregatedTransactionSimulationResult
  | SolAggregatedTransactionSimulationResult

export type SolSimulateTransactionParams = {
  asset: AssetBase
  origin: string
  overrideApiEndpoint?: string
  senderAddress: string
  transactions: unknown[]
}

export type { TxSimulator } from './index.js'
