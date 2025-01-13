import { getConfigReduxEvents, getEventReduxMap } from '../utils.js'

const uiConfigDefinition = {
  exchangeFromAsset: {
    id: 'exchangeFromAsset',
  },
}
describe('UiConfig utils', () => {
  it('should get event names from definition', () => {
    expect(getConfigReduxEvents(uiConfigDefinition)).toEqual(
      new Map([['EVENT_EXCHANGE_FROM_ASSET_CONFIG', 'exchangeFromAsset']])
    )
  })
  it('should get event redux map from definition', () => {
    expect(getEventReduxMap(uiConfigDefinition)).toEqual({
      exchangeFromAssetConfigAtom: 'EVENT_EXCHANGE_FROM_ASSET_CONFIG',
    })
  })
})
