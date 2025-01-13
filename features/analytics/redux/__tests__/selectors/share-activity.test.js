import { setup } from '../utils'

describe('share-activity', () => {
  it('should return default data', () => {
    const { store, selectors } = setup()

    expect(selectors.analytics.shareActivity(store.getState())).toEqual(true)
  })

  it('should return current data', () => {
    const { store, selectors, handleEvent } = setup()

    handleEvent('shareActivity', false)

    expect(selectors.analytics.shareActivity(store.getState())).toEqual(false)
  })
})
