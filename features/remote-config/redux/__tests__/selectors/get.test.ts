import { setup } from '../utils.js'

describe('code', () => {
  it('should return undefined for path when not loaded', () => {
    const { store, selectors } = setup()

    expect(selectors.remoteConfig).toBeDefined()
    expect(selectors.remoteConfig!.get('hogwarts.isOpen')(store.getState())).toEqual(undefined)
  })

  it('should return undefined for missing path', () => {
    const { store, selectors, handleEvent } = setup()

    handleEvent('remoteConfig', { hogwarts: { isSafe: false } })

    expect(selectors.remoteConfig).toBeDefined()
    expect(selectors.remoteConfig!.get('hogwarts.isOpen')(store.getState())).toEqual(undefined)
  })

  it('should return selected path', () => {
    const { store, selectors, handleEvent } = setup()

    handleEvent('remoteConfig', { hogwarts: { isSafe: false } })

    expect(selectors.remoteConfig?.get('hogwarts.isSafe')(store.getState())).toEqual(false)
  })
})
