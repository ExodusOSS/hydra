import { createSimulationServices } from '@exodus/web3-simulation'
import assets from '@exodus/assets-base'
import { deserializeTransaction } from '@exodus/web3-solana-utils'

import txSimulatorDefinition from '../'

jest.mock('@exodus/web3-simulation')

const assetsModule = {
  getAsset: (name: string) => assets[name],
}

const createTxSimulator = () => {
  return txSimulatorDefinition.factory({
    assetsModule,
    assetClientInterface: {},
    config: {
      apiUrl: 'https://simulation.a.exodus.io',
    },
    logger: {
      warn: () => {}, // noop
    },
  })
}

assets.solana.api = {
  getFeeData: () => Promise.resolve({ fee: assets.solana.currency.defaultUnit(5000) }),
}
assets.solana.baseAsset = assets.solana

describe('tx-simulator', () => {
  it('should simulate a solana transaction', async () => {
    console.log({ createSimulationServices })
    ;(createSimulationServices as jest.Mock).mockImplementation(() => ({
      simulateSolanaTransactions: () => ({
        advancedDetails: [
          {
            instructions: [
              {
                formattedValue: 'Comp..1111',
                name: 'Program Id',
                value: 'ComputeBudget111111111111111111111111111111',
              },
              {
                formattedValue: 'AsBcFQA=',
                name: 'Raw Data',
                value: 'AsBcFQA=',
              },
            ],
            title: 'Unknown',
          },
          {
            instructions: [
              {
                formattedValue: 'Comp..1111',
                name: 'Program Id',
                value: 'ComputeBudget111111111111111111111111111111',
              },
              {
                formattedValue: 'AwQXAQAAAAAA',
                name: 'Raw Data',
                value: 'AwQXAQAAAAAA',
              },
            ],
            title: 'Unknown',
          },
          {
            instructions: [
              {
                formattedValue: 'ATok..8knL',
                name: 'Program Id',
                value: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
              },
            ],
            title: 'Create Token Account',
          },
          {
            instructions: [
              {
                formattedValue: '8cBx..8Yws',
                name: 'From Public Key',
                value: '8cBxsCL2q2jMXqHweMaHmP7v2RbB4WG5buTXmjXa8Yws',
              },
              {
                formattedValue: 'BWNe..9CSR',
                name: 'To Public Key',
                value: 'BWNevwu92XRSD3c9DBhZrq9JFMUGcN9nm1dmKxY19CSR',
              },
              {
                formattedValue: '0.1048 SOL',
                name: 'Amount',
                value: '0.1048 SOL',
              },
            ],
            title: 'Transfer SOL',
          },
          {
            instructions: [
              {
                formattedValue: 'BWNe..9CSR',
                name: 'Public Key',
                value: 'BWNevwu92XRSD3c9DBhZrq9JFMUGcN9nm1dmKxY19CSR',
              },
            ],
            title: 'Create Sync Native Account',
          },
          {
            instructions: [
              {
                formattedValue: 'JUP6..TaV4',
                name: 'Program Id',
                value: 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',
              },
              {
                formattedValue: 'wSCb..VQ==',
                name: 'Raw Data',
                value: 'wSCbM0HWnIEEAQAAABwAZAABSkQ/BgAAAADXG6/dFgAAAMgAVQ==',
              },
            ],
            title: 'Unknown',
          },
          {
            instructions: [
              {
                formattedValue: 'BWNe..9CSR',
                name: 'Source Public Key',
                value: 'BWNevwu92XRSD3c9DBhZrq9JFMUGcN9nm1dmKxY19CSR',
              },
              {
                formattedValue: '8cBx..8Yws',
                name: 'Destination Public Key',
                value: '8cBxsCL2q2jMXqHweMaHmP7v2RbB4WG5buTXmjXa8Yws',
              },
              {
                formattedValue: '8cBx..8Yws',
                name: 'Owner Public Key',
                value: '8cBxsCL2q2jMXqHweMaHmP7v2RbB4WG5buTXmjXa8Yws',
              },
            ],
            title: 'Close Account',
          },
        ],
        balanceChanges: {
          willApprove: [],
          willPayFee: [
            {
              balance: {
                type: 'NumberUnit',
                unit: 'SOL',
                unitType: 'SOL',
                value: '5000',
              },
            },
          ],
          willReceive: [
            {
              balance: {
                type: 'NumberUnit',
                unit: 'base',
                unitType: 'Bonk',
                value: '100934700000',
              },
            },
          ],
          willSend: [
            {
              balance: {
                type: 'NumberUnit',
                unit: 'base',
                unitType: 'SOL',
                value: '104809546',
              },
            },
          ],
        },
        baseAssetName: 'solana',
        displayDetails: {
          warnings: [],
        },
        transactions: [],
      }),
    }))

    const simulationResult = await createTxSimulator().simulate({
      assetName: 'solana',
      transactions: [
        deserializeTransaction(
          'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAQAIDnEFiG4DTZRCbmnlsIoI3aN48Z+uAD3YHPdxGxDNU+kyWO9nf7VjXmRzcktw4WtkBVQDTqR6HHs/zYiFPEFdMlRz5cjChx7fASyDZXpi4eeIlroBba7O6Ha71C+pOt3deJwbMmsJnEMjC0q1UfKO/vm8lB7xy8Qv2bts1M7ijF6u1JIwjXYeeEPjR4K57wzJvgWOZAZSwyw3treT+Ax5/Dnd9SAxdDGH/Fn4MZNi0fkAVLnSg74IDSJ337fzl3gWCQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwZGb+UhFzL/7K26csOb57yM5bvF9xJrLEObOkAAAAAEedVb8jHAbu50xW7OaBUH/bGy3qP0jlECsc2iVrwTjwbd9uHXZaGT2cvhRs7reawctIXtX1s3kTqM9YV+/wCpOriQP7c1yrHGfFmvSFft9hsK+DKlCnxZ4yGRng7IqbyMlyWPTiSJ8bs9ECkUjg2DC1oTmdr/EIQEjnvY2+n4WbQ/+if11/ZKdMCbHylYed5LCas238ndUUsyGqezjOXovAfFbmCtPT8Xc4LqxlSPuh/TLP2QygKz58+hhf3Oc5ha/PTzYK2uaCqy9gLVLXh6yn1xtnMYT0oGzv5G667rSQcHAAUCwFwVAAcACQMEFwEAAAAAAAsGAAMAEgYJAQEGAgADDAIAAABKRD8GAAAAAAkBAwERCBYJCgADAQQCEg0FCAwIERMPCgQBEA4JJcEgmzNB1pyBBAEAAAAcAGQAAUpEPwYAAAAA1xuv3RYAAADIAFUJAwMAAAEJAWhrKDhvF3v5paQOu9+BZi1gmEU3DJz8lRgcZwTCQBuZA/n7+gP2hvc='
        ),
      ],
      origin: 'https://jup.ag',
      senderAddress: '8cBxsCL2q2jMXqHweMaHmP7v2RbB4WG5buTXmjXa8Yws',
    })

    expect(simulationResult).toMatchSnapshot()
  })
})
