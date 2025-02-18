import { TxSet } from '@exodus/models'

import { ORDERS_COUNT_WITH_GUARANTEED_MATCH } from '../constants.js'
import findOptimisticOrders from '../index.js'
import Order from './order.js'

const OrderSet = {
  fromArray: (arr) => arr.map((orderJSON) => new Order(orderJSON)),
}

describe('findOptimisticOrders return collection of orders and txIds', () => {
  const createTx = (data) => ({
    txId: 'tx-1',
    error: null,
    date: '2019-07-22T14:18:09.000Z',
    confirmations: 1,
    meta: {},
    token: null,
    dropped: false,
    coinAmount: '0.1 ETH',
    coinName: 'ethereum',
    currencies: { ethereum: { ETH: 18, wei: 0 } },
    ...data,
  })

  const createOrder = (data) => ({
    orderId: 'order-1',
    status: 'waiting',
    date: '2019-07-22T14:18:09.000Z',
    fromTxId: 'from-tx-1',
    fromAsset: 'bitcoin',
    fromAmount: '0.0001 BTC',
    toAsset: 'ethereum',
    toAmount: '0.2 ETH',
    fromWalletAccount: 'exodus_0',
    toWalletAccount: 'exodus_0',
    svc: 'cs',
    ...data,
  })

  const emptyPreTxs = TxSet.fromArray([])

  test('match order when tx received', () => {
    const existingTxs = [
      createTx({
        txId: 'tx-1',
        coinAmount: '0.1 ETH',
      }),
    ]
    const newTxs = [
      createTx({
        txId: 'tx-2',
        coinAmount: '0.2 ETH',
      }),
    ]

    const preTxs = TxSet.fromArray(existingTxs)
    const postTxs = TxSet.fromArray([...existingTxs, ...newTxs])

    const incomingOrders = [
      ...OrderSet.fromArray([
        createOrder({
          toAmount: '0.2 ETH',
        }),
      ]),
    ]

    const optimisticOrders = findOptimisticOrders({ incomingOrders, postTxs, preTxs })

    expect(optimisticOrders.length).toBe(1)
    expect(optimisticOrders[0].status).toBe('optimistic-complete')
    expect(optimisticOrders[0].toTxId).toBe('tx-2')
  })

  test('match orders when multiple tx received', () => {
    const existingTxs = [
      createTx({
        txId: 'tx-1',
        coinAmount: '0.1 ETH',
      }),
    ]
    const newTxs = [
      createTx({
        txId: 'tx-2',
        coinAmount: '0.2 ETH',
      }),
      createTx({
        txId: 'tx-3',
        coinAmount: '0.3 ETH',
      }),
    ]

    const preTxs = TxSet.fromArray(existingTxs)
    const postTxs = TxSet.fromArray([...existingTxs, ...newTxs])

    const incomingOrders = [
      ...OrderSet.fromArray([
        createOrder({
          orderId: 'order-1',
          toAmount: '0.2 ETH',
        }),
        createOrder({
          orderId: 'order-2',
          toAmount: '0.3 ETH',
        }),
      ]),
    ]

    const optimisticOrders = findOptimisticOrders({ incomingOrders, postTxs, preTxs })

    expect(optimisticOrders.length).toBe(2)
    expect(optimisticOrders[0].orderId).toBe('order-1')
    expect(optimisticOrders[0].status).toBe('optimistic-complete')
    expect(optimisticOrders[0].toTxId).toBe('tx-2')
    expect(optimisticOrders[1].orderId).toBe('order-2')
    expect(optimisticOrders[1].status).toBe('optimistic-complete')
    expect(optimisticOrders[1].toTxId).toBe('tx-3')
  })

  test('handle orders with different svc', () => {
    const postTxs = TxSet.fromArray([
      createTx({
        txId: 'tx-2',
        coinAmount: '0.3 ETH',
      }),
      createTx({
        txId: 'tx-3',
        coinAmount: '0.1 ETH',
      }),
    ])

    const incomingOrders = [
      ...OrderSet.fromArray([
        createOrder({
          orderId: 'order-1',
          toAmount: '0.1 ETH',
          svc: 'chf',
        }),
        createOrder({
          orderId: 'order-2',
          toAmount: '0.3 ETH',
          svc: 'cs',
        }),
      ]),
    ]

    const optimisticOrders = findOptimisticOrders({ incomingOrders, postTxs, preTxs: emptyPreTxs })
    expect(optimisticOrders.length).toBe(2)

    expect(optimisticOrders[0].status).toBe('optimistic-complete')
    expect(optimisticOrders[0].orderId).toBe('order-1')
    expect(optimisticOrders[0].toTxId).toBe('tx-3')

    expect(optimisticOrders[1].orderId).toBe('order-2')
    expect(optimisticOrders[1].status).toBe('optimistic-complete')
    expect(optimisticOrders[1].toTxId).toBe('tx-2')
  })

  test('use transaction to match order only once', () => {
    const postTxs = TxSet.fromArray([
      createTx({
        txId: 'tx-1',
        coinAmount: '0.3 ETH',
      }),
    ])

    const incomingOrders = [
      ...OrderSet.fromArray([
        createOrder({
          orderId: 'order-1',
          toAmount: '0.3 ETH',
          svc: 'chf',
        }),
        createOrder({
          orderId: 'order-2',
          toAmount: '0.3 ETH',
          svc: 'cs',
        }),
      ]),
    ]

    const optimisticOrders = findOptimisticOrders({ incomingOrders, postTxs, preTxs: emptyPreTxs })
    expect(optimisticOrders.length).toBe(1)

    expect(optimisticOrders[0].status).toBe('optimistic-complete')
    expect(optimisticOrders[0].orderId).toBe('order-1')
    expect(optimisticOrders[0].toTxId).toBe('tx-1')
    expect(optimisticOrders[0].svc).toBe('chf')
  })

  test('match N orders when sum of their amounts is equal to tx amount', () => {
    const preTxs = TxSet.fromArray([])
    const postTxs = TxSet.fromArray([
      createTx({
        txId: 'tx-2',
        coinAmount: '300 ETH', // batch of all orders orders
      }),
    ])

    const ordersArray = Array.from({ length: 300 }).map((i, index) =>
      createOrder({
        orderId: `order-${index}`,
        toAmount: `1 ETH`,
      })
    )

    const incomingOrders = [...OrderSet.fromArray(ordersArray)]

    // const start = Date.now()
    const optimisticOrders = findOptimisticOrders({ incomingOrders, postTxs, preTxs })
    // console.log('time', Date.now() - start)

    expect(optimisticOrders.length).toEqual(300)
  })

  test('match tx with 2 batched orders', () => {
    const postTxs = TxSet.fromArray([
      createTx({
        txId: 'tx-2',
        coinAmount: '0.6 ETH',
      }),
      createTx({
        txId: 'simple-received-tx',
        coinAmount: '1.6 ETH',
      }),
    ])
    const orderJson = createOrder({
      orderId: 'order-1',
      toAmount: '0.4 ETH',
    })
    const orderJson2 = createOrder({
      orderId: 'order-2',
      toAmount: '0.2 ETH',
    })

    const incomingOrders = [...OrderSet.fromArray([orderJson, orderJson2])]
    const optimisticOrders = findOptimisticOrders({ incomingOrders, postTxs, preTxs: emptyPreTxs })

    expect(optimisticOrders.length).toBe(2)

    expect(optimisticOrders[0].status).toBe('optimistic-complete')
    expect(optimisticOrders[0].orderId).toBe('order-1')
    expect(optimisticOrders[0].toTxId).toBe('tx-2')

    expect(optimisticOrders[1].orderId).toBe('order-2')
    expect(optimisticOrders[1].status).toBe('optimistic-complete')
    expect(optimisticOrders[1].toTxId).toBe('tx-2')
  })

  test('match tx with 3 batched orders', () => {
    const postTxs = TxSet.fromArray([
      createTx({
        txId: 'tx-2',
        coinAmount: '0.6 ETH',
      }),
      createTx({
        txId: 'simple-received-tx-not-related-to-orders',
        coinAmount: '1.6 ETH',
      }),
    ])
    const orderJson = createOrder({
      orderId: 'order-1',
      toAmount: '0.1 ETH',
    })
    const orderJson2 = createOrder({
      orderId: 'order-2',
      toAmount: '0.3 ETH',
    })
    const orderJson3 = createOrder({
      orderId: 'order-3',
      toAmount: '0.2 ETH',
    })

    const incomingOrders = [...OrderSet.fromArray([orderJson, orderJson2, orderJson3])]
    const optimisticOrders = findOptimisticOrders({ incomingOrders, postTxs, preTxs: emptyPreTxs })

    expect(optimisticOrders.length).toBe(3)

    expect(optimisticOrders[0].status).toBe('optimistic-complete')
    expect(optimisticOrders[0].orderId).toBe('order-1')
    expect(optimisticOrders[0].toTxId).toBe('tx-2')

    expect(optimisticOrders[1].orderId).toBe('order-2')
    expect(optimisticOrders[1].status).toBe('optimistic-complete')
    expect(optimisticOrders[1].toTxId).toBe('tx-2')

    expect(optimisticOrders[2].orderId).toBe('order-3')
    expect(optimisticOrders[1].status).toBe('optimistic-complete')
    expect(optimisticOrders[1].toTxId).toBe('tx-2')
  })

  test('match tx with 4 batched orders when orders count < 30', () => {
    const postTxs = TxSet.fromArray([
      createTx({
        txId: 'tx-2',
        coinAmount: '168.8325 ETH', // batch of 10+51.2525+53.71+53.87 orders
      }),
    ])
    const ordersArray = [
      ...Array.from({ length: 10 }).map((i, index) =>
        createOrder({
          orderId: `order-${index}`,
          toAmount: `${index + 1} ETH`,
        })
      ),
      createOrder({
        date: '2019-07-22T13:18:09.000Z', // to increase hardness of test - provider pay for order created at different times
        orderId: `order-51.2525`,
        toAmount: `51.2525 ETH`,
      }),
      createOrder({
        date: '2019-07-22T15:18:09.000Z',
        toAmount: '53.71 ETH',
        orderId: `order-53.71`,
      }),
      createOrder({
        date: '2019-07-22T10:18:09.000Z',
        toAmount: '53.87 ETH',
        orderId: `order-53.87`,
      }),
      ...Array.from({ length: 10 }).map((i, index) =>
        createOrder({
          toAmount: `${index + 55} ETH`,
          orderId: `${index + 55}`,
        })
      ),
    ]
    const incomingOrders = [...OrderSet.fromArray(ordersArray)]
    // const start = Date.now()
    const optimisticOrders = findOptimisticOrders({ incomingOrders, postTxs, preTxs: emptyPreTxs })
    // console.log('test time', Date.now() - start)
    // console.log(
    //   'test optimisticOrders',
    //   optimisticOrders.map((order) => ({
    //     toAmount: order.toAmount.toString(),
    //     id: order.orderId,
    //   }))
    // )
    expect(optimisticOrders.length).toEqual(4)
  })

  test('match N orders sorted by date when sum of their amounts is equal to tx amount', () => {
    const preTxs = TxSet.fromArray([])
    const postTxs = TxSet.fromArray([
      createTx({
        txId: 'tx-2',
        coinAmount: '50 ETH', // batch of 50 orders orders
      }),
    ])

    const ordersArray = [
      ...Array.from({ length: 50 }).map((i, index) =>
        createOrder({
          orderId: `order-created-before-next-chunk-of-orders-${index}`,
          date: '2019-01-01T09:00:00.000Z',
          toAmount: `0.0001 ETH`,
        })
      ),
      // these is the orders we will try to match, their sum is 50 ETH
      ...Array.from({ length: 50 }).map((i, index) =>
        createOrder({
          orderId: `order-${index}`,
          date: '2019-01-01T10:00:00.000Z',
          toAmount: `1 ETH`,
        })
      ),
      createOrder({
        orderId: `order-created-after-provider-prepared-payout-for-first-50`,
        date: '2019-01-01T10:05:00.000Z',
        toAmount: `0.001 ETH`,
      }),
    ]
    const incomingOrders = [...OrderSet.fromArray(ordersArray)]

    // const start = Date.now()
    const optimisticOrders = findOptimisticOrders({ incomingOrders, postTxs, preTxs })
    // console.log('time', Date.now() - start)

    expect(optimisticOrders.length).toEqual(50)
    expect(optimisticOrders.every((o) => o.toAmount.toString() === '1 ETH')).toEqual(true)
  })

  test('should match any number of orders combinations up to limit', () => {
    const orderValuesArray = [7, 10, 11, 12, 13, 14, 15, 101]

    const targetAmount = [10, 11, 12, 13, 14, 101].reduce((total, amount) => {
      total += amount
      return total
    }, 0)

    const receivedTx = createTx({
      txId: 'tx-1',
      coinAmount: `${targetAmount} ETH`,
    })

    const matchedOrders = findOptimisticOrders({
      incomingOrders: [
        ...OrderSet.fromArray(
          orderValuesArray.map((value, index) => {
            return createOrder({
              orderId: `order-${index}`,
              toAmount: `${value} ETH`,
            })
          })
        ),
      ],
      postTxs: TxSet.fromArray([receivedTx]),
      preTxs: emptyPreTxs,
    })

    expect(matchedOrders.length).toEqual(6)
  })

  describe('should match as much as possible order to reduce difference between real balance and displayed balance for users who exchange 4+ order at the same time and receive batched payouts for different orders in different sorting order', () => {
    test('should match case 1: received payout for orders 1-7 and 9 from 9 orders', () => {
      const receivedTx1 = createTx({
        txId: 'tx-1',
        coinAmount: `83.8 ETH`, // pay for 1-7 and 9 orders
      })
      const matchedOrders1 = findOptimisticOrders({
        incomingOrders: [
          ...OrderSet.fromArray([
            createOrder({
              orderId: 'order-1',
              toAmount: '10 ETH',
            }),
            createOrder({
              orderId: 'order-2',
              toAmount: '10.1 ETH',
            }),
            createOrder({
              orderId: 'order-3',
              toAmount: '10.1 ETH',
            }),
            createOrder({
              orderId: 'order-4',
              toAmount: '10.2 ETH',
            }),
            createOrder({
              orderId: 'order-5',
              toAmount: '10.3 ETH',
            }),
            createOrder({
              orderId: 'order-6',
              toAmount: '11 ETH',
            }),
            createOrder({
              orderId: 'order-7',
              toAmount: '12 ETH',
            }),
            createOrder({
              orderId: 'order-8',
              toAmount: '3 ETH',
            }),
            createOrder({
              orderId: 'order-9',
              toAmount: '10.1 ETH',
            }),
          ]),
        ],
        postTxs: TxSet.fromArray([receivedTx1]),
        preTxs: emptyPreTxs,
      })

      // since we sort orders by amount, algorithm will loop [3, 10, 10.1, 10.1, 10.1, 10.2, 10.3, 11, 12]
      // and select [3, 10, 10.1, 10.1, 10.1, 10.2, 10.3, 11]. order-7 left in pending orders, though in reality tx pays for 1-7 and 9...
      const expectedMatchedOrders1 = [
        {
          orderId: 'order-8',
          toAmount: '3 ETH',
          potentialToTxIds: ['tx-1'],
          status: 'potential-complete',
        },
        {
          orderId: 'order-1',
          toAmount: '10 ETH',
          potentialToTxIds: ['tx-1'],
          status: 'potential-complete',
        },
        {
          orderId: 'order-2',
          toAmount: '10.1 ETH',
          potentialToTxIds: ['tx-1'],
          status: 'potential-complete',
        },
        {
          orderId: 'order-3',
          toAmount: '10.1 ETH',
          potentialToTxIds: ['tx-1'],
          status: 'potential-complete',
        },
        {
          orderId: 'order-9',
          toAmount: '10.1 ETH',
          potentialToTxIds: ['tx-1'],
          status: 'potential-complete',
        },
        {
          orderId: 'order-4',
          toAmount: '10.2 ETH',
          potentialToTxIds: ['tx-1'],
          status: 'potential-complete',
        },
        {
          orderId: 'order-5',
          toAmount: '10.3 ETH',
          potentialToTxIds: ['tx-1'],
          status: 'potential-complete',
        },
        {
          orderId: 'order-6',
          toAmount: '11 ETH',
          potentialToTxIds: ['tx-1'],
          status: 'potential-complete',
        },
      ]
      expect(matchedOrders1.length).toEqual(8)
      expect(
        matchedOrders1.map((o) => ({
          orderId: o.orderId,
          toAmount: o.toAmount.toString(),
          potentialToTxIds: o.potentialToTxIds,
          status: o.status,
        }))
      ).toEqual(expectedMatchedOrders1)

      const receivedTx2 = createTx({
        txId: 'tx-2',
        coinAmount: `3 ETH`, // pay for order-8
      })

      const potentialOrders1 = expectedMatchedOrders1.map((orderData) => createOrder(orderData))

      const incomingOrders2 = [
        ...OrderSet.fromArray([
          ...potentialOrders1,
          createOrder({
            orderId: 'order-7',
            toAmount: '12 ETH',
          }),
        ]),
      ]

      const matchedOrders2 = findOptimisticOrders({
        incomingOrders: incomingOrders2,
        postTxs: TxSet.fromArray([receivedTx1, receivedTx2]),
        preTxs: TxSet.fromArray([receivedTx1]),
      })

      expect(matchedOrders2.length).toEqual(9)
      expect(matchedOrders2.every((o) => o.status === 'optimistic-complete')).toEqual(true)
    })

    test('dont match orders if tx amount more then orders sum', () => {
      const postTxs = TxSet.fromArray([
        createTx({
          txId: 'tx-1',
          coinAmount: '30 ETH',
        }),
      ])

      const incomingOrders = OrderSet.fromArray(
        Array.from({ length: ORDERS_COUNT_WITH_GUARANTEED_MATCH + 1 }).map((i, index) =>
          createOrder({
            orderId: `order-${index}`,
            toAmount: '0.01 ETH',
          })
        )
      )

      const optimisticOrders = findOptimisticOrders({
        incomingOrders,
        postTxs,
        preTxs: emptyPreTxs,
      })
      expect(optimisticOrders.length).toBe(0)
    })
  })

  test('should mark orders as potential complete', () => {
    const postTxs = TxSet.fromArray([
      createTx({
        txId: 'tx-1',
        coinAmount: '3.5 ETH',
      }),
    ])

    const orders = Array.from({ length: ORDERS_COUNT_WITH_GUARANTEED_MATCH + 1 }).map((i, index) =>
      createOrder({
        orderId: `order-${index}`,
        toAmount: '1 ETH',
      })
    )

    const incomingOrders = OrderSet.fromArray(orders)

    const optimisticOrders = findOptimisticOrders({
      incomingOrders,
      postTxs,
      preTxs: emptyPreTxs,
    })
    expect(optimisticOrders.length).toBe(3)
    expect(optimisticOrders[0].orderId).toEqual('order-0')
    expect(optimisticOrders[0].status).toEqual('potential-complete')
    expect(optimisticOrders[0].potentialToTxIds).toEqual(['tx-1'])

    expect(optimisticOrders[1].orderId).toEqual('order-1')
    expect(optimisticOrders[1].status).toEqual('potential-complete')
    expect(optimisticOrders[1].potentialToTxIds).toEqual(['tx-1'])

    expect(optimisticOrders[2].orderId).toEqual('order-2')
    expect(optimisticOrders[2].status).toEqual('potential-complete')
    expect(optimisticOrders[2].potentialToTxIds).toEqual(['tx-1'])

    const postTxs2 = TxSet.fromArray([
      createTx({
        txId: 'tx-1',
        coinAmount: '3.5 ETH',
      }),
      createTx({
        txId: 'tx-2',
        coinAmount: '1 ETH',
      }),
    ])

    const orders2 = [...orders]
    orders2[0].status = 'potential-complete'
    orders2[0].potentialToTxIds = ['tx-1']
    orders2[1].status = 'potential-complete'
    orders2[1].potentialToTxIds = ['tx-1']
    orders2[2].status = 'potential-complete'
    orders2[2].potentialToTxIds = ['tx-1']

    const incomingOrders2 = [...OrderSet.fromArray(orders2)]

    const optimisticOrders2 = findOptimisticOrders({
      incomingOrders: incomingOrders2,
      postTxs: postTxs2,
      preTxs: postTxs,
    })

    expect(optimisticOrders2.length).toBe(4)
    expect(optimisticOrders2[0].orderId).toEqual('order-0')
    expect(optimisticOrders2[0].status).toEqual('potential-complete')
    expect(optimisticOrders2[0].potentialToTxIds).toEqual(['tx-2', 'tx-1'])
    expect(optimisticOrders2[1].orderId).toEqual('order-1')
    expect(optimisticOrders2[1].status).toEqual('potential-complete')
    expect(optimisticOrders2[1].potentialToTxIds).toEqual(['tx-2', 'tx-1'])
    expect(optimisticOrders2[2].orderId).toEqual('order-2')
    expect(optimisticOrders2[2].status).toEqual('potential-complete')
    expect(optimisticOrders2[2].potentialToTxIds).toEqual(['tx-2', 'tx-1'])
    expect(optimisticOrders2[3].orderId).toEqual('order-3')
    expect(optimisticOrders2[3].status).toEqual('potential-complete')
    expect(optimisticOrders2[3].potentialToTxIds).toEqual(['tx-2', 'tx-1'])
  })

  test('should match EOS creation tx', () => {
    const existingTxs = []
    const newTxs = [
      createTx({
        txId: 'tx-1',
        coinAmount: '0.18 EOS',
        coinName: 'eosio',
        currencies: { eosio: { EOS: 4, lamport: 0 } },
      }),
    ]

    const preTxs = TxSet.fromArray(existingTxs)
    const postTxs = TxSet.fromArray([...existingTxs, ...newTxs])

    const incomingOrders = [
      ...OrderSet.fromArray([
        createOrder({
          orderId: 'order-1',
          toAsset: 'eosio',
          toAmount: '10 EOS',
        }),
        createOrder({
          orderId: 'order-2',
          toAsset: 'eosio',
          toAmount: '0.2 EOS',
        }),
      ]),
    ]

    const optimisticOrders = findOptimisticOrders({ incomingOrders, postTxs, preTxs })

    expect(optimisticOrders.length).toBe(1)
    expect(optimisticOrders[0].orderId).toBe('order-2')
    expect(optimisticOrders[0].status).toBe('optimistic-complete')
    expect(optimisticOrders[0].toTxId).toBe('tx-1')
  })

  test('match order with toTxId', () => {
    const existingTxs = [
      createTx({
        txId: 'tx-1',
        coinAmount: '0.1 ETH',
      }),
    ]
    const newTxs = [
      createTx({
        txId: 'tx-2',
        coinAmount: '0.2 ETH',
      }),
    ]

    const preTxs = TxSet.fromArray(existingTxs)
    const postTxs = TxSet.fromArray([...existingTxs, ...newTxs])

    const incomingOrders = [
      ...OrderSet.fromArray([
        createOrder({
          toTxId: 'tx-2',
          toAmount: '0.9 ETH', // shouldn't be possible, but just to test that match happens by toTxId we make it random
        }),
      ]),
    ]

    const optimisticOrders = findOptimisticOrders({ incomingOrders, postTxs, preTxs })

    expect(optimisticOrders.length).toBe(1)
    expect(optimisticOrders[0].status).toBe('optimistic-complete')
    expect(optimisticOrders[0].toTxId).toBe('tx-2')
  })
})
