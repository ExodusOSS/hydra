import { createSimulationServices } from '@exodus/web3-simulation'

import type {
  AssetsModule,
  Logger,
  SimulateParams,
  SimulateResponse,
  SolSimulateTransactionParams,
  TxSimulatorConstructor,
} from './types.js'
import type { SolAggregatedTransactionSimulationResult } from '@exodus/web3-solana-utils/lib'
import type {
  EthAggregatedTransactionSimulationResult,
  EthSimulateTransactionParams,
} from '@exodus/web3-ethereum-utils'
import type { Definition } from '@exodus/dependency-types'

export class TxSimulator {
  #assetsModule: AssetsModule
  #logger: Logger

  #simulateSolanaTransactions: (
    params: SolSimulateTransactionParams
  ) => Promise<SolAggregatedTransactionSimulationResult>

  #simulateEthereumTransactions: (
    params: EthSimulateTransactionParams
  ) => Promise<EthAggregatedTransactionSimulationResult>

  constructor({
    assetsModule,
    assetClientInterface,
    logger,
    config = Object.create(null),
  }: TxSimulatorConstructor) {
    this.#assetsModule = assetsModule
    this.#logger = logger

    const { simulateSolanaTransactions, simulateEthereumTransactions } = createSimulationServices({
      apiBaseURL: config.apiUrl,
      assetClientInterface,
    })

    this.#simulateEthereumTransactions = simulateEthereumTransactions
    this.#simulateSolanaTransactions = simulateSolanaTransactions
  }

  async simulate(params: SimulateParams): Promise<SimulateResponse | undefined> {
    const { assetName, ...rest } = params

    const asset = this.#assetsModule.getAsset(assetName)

    // Temporarily ignoring to make linting work.
    // The package will be deprecated soon.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (asset.baseAsset.api.web3?.simulateTransactions) {
      return asset.baseAsset.api.web3.simulateTransactions(params)
    }

    // eslint-disable-next-line @exodus/hydra/no-asset-conditions
    if (asset.baseAssetName === 'solana') {
      return this.#simulateSolanaTransactions({
        asset: asset.baseAsset,
        ...rest,
      } as SolSimulateTransactionParams)
    }

    // eslint-disable-next-line @exodus/hydra/no-asset-conditions
    if (asset.baseAsset.assetType === 'ETHEREUM_LIKE') {
      return this.#simulateEthereumTransactions({ ...rest } as EthSimulateTransactionParams)
    }

    this.#logger.warn(`No simulation service available for ${asset.name}`)
  }
}

const txSimulatorFactory = (args: TxSimulatorConstructor) => new TxSimulator({ ...args })

const txSimulatorDefinition = {
  id: 'txSimulator',
  type: 'module',
  factory: txSimulatorFactory,
  dependencies: ['assetsModule', 'logger', 'assetClientInterface', 'config?'],
  public: true,
} as const satisfies Definition

export default txSimulatorDefinition
