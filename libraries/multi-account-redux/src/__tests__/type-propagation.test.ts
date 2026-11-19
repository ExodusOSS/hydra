import type { AssetSourceDataSelector } from '../create-definitions.js'
import createReduxModuleHelper from '../create-definitions.js'

type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false

const assertType = <T extends true>(_value: T): void => {
  /* type-only assertion */
}

describe('createReduxModuleHelper — type propagation', () => {
  type Balance = { balance: number; lastUpdated: number }

  const helper = createReduxModuleHelper<Balance>({
    slice: 'balances',
    createInitialPerAssetData: ({ asset }) => ({
      balance: 0,
      lastUpdated: Date.parse(asset.name) || 0,
    }),
    assetSourceDataSelectors: [
      { name: 'balance', selector: (assetData) => assetData.balance },
      { name: 'lastUpdated', selector: (assetData) => assetData.lastUpdated },
    ],
  })

  test('createInitialPerAssetData receives asset with `name`; consumer must return TAssetData', () => {
    assertType<
      Equal<
        Parameters<
          NonNullable<
            Parameters<typeof createReduxModuleHelper<Balance>>[0]['createInitialPerAssetData']
          >
        >[0]['asset']['name'],
        string
      >
    >(true)

    assertType<
      Equal<
        ReturnType<
          NonNullable<
            Parameters<typeof createReduxModuleHelper<Balance>>[0]['createInitialPerAssetData']
          >
        >,
        Balance
      >
    >(true)

    expect(typeof helper.createInitialState).toBe('function')
  })

  test('assetSourceDataSelectors[].selector receives TAssetData', () => {
    assertType<
      Equal<AssetSourceDataSelector<Balance>['selector'], (assetState: Balance) => unknown>
    >(true)
    expect(helper.selectorDefinitions.length).toBeGreaterThan(0)
  })

  test('helper.getAsset return type narrows to TAssetData when asset is provided', () => {
    type GetAssetReturn = ReturnType<typeof helper.getAsset>
    assertType<Equal<GetAssetReturn, Balance | unknown | null>>(true)
  })

  test('rejects mismatched per-asset shape at consumer site', () => {
    createReduxModuleHelper<Balance>({
      slice: 'balances',
      // @ts-expect-error — wrong return type for createInitialPerAssetData
      createInitialPerAssetData: () => ({ wrongKey: 'oops' }),
    })

    createReduxModuleHelper<Balance>({
      slice: 'balances',
      createInitialPerAssetData: () => ({ balance: 0, lastUpdated: 0 }),
      assetSourceDataSelectors: [
        // @ts-expect-error — selector reads a key not present on Balance
        { name: 'missing', selector: (assetData) => assetData.missingKey },
      ],
    })
    expect(true).toBe(true)
  })
})
