import { createSelector } from 'reselect'
import { createRedux } from './setup.js'

describe('redux-dependency-injection', () => {
  it('should handle events and actions', () => {
    const { store, handleEvent } = createRedux({
      eventReducers: {
        upgrade: (state, payload) => ({ ...state, speed: payload.speed }),
      },
      actionReducers: {
        SET_PRICE: (state, payload) => ({ ...state, price: payload }),
      },
    })

    handleEvent('upgrade', { speed: 500 })
    expect(store.getState()).toEqual({ batmobile: { speed: 500 } })

    store.dispatch({ type: 'SET_PRICE', payload: 42 })
    expect(store.getState()).toEqual({ batmobile: { speed: 500, price: 42 } })
  })

  it('should generate a logger selector', () => {
    const info = jest.fn()
    const createLogger = jest.fn(() => ({ info, debug: jest.fn() }))
    const { selectors } = createRedux({
      createLogger,
      selectorDefinitions: [
        {
          id: 'driver',
          resultFunction: (logger) => {
            logger.info('Driver of batmobile revealed')
            return 'Bruce Wayne'
          },
          dependencies: [{ selector: 'logger' }],
        },
      ],
    })

    selectors.batmobile.driver()

    expect(info).toHaveBeenCalledWith('Driver of batmobile revealed')
    expect(createLogger).toHaveBeenCalledWith('exodus:batmobile:redux')
  })

  describe('optional dependencies', () => {
    const createLogger = () => ({ info: () => {}, debug: () => {} })
    const batsSelector = {
      id: 'external.selectors.bats',
      factory: () => () => [{ name: 'Bill' }],
    }

    const catsSelector = {
      id: 'external.selectors.cats',
      factory: () => () => [{ name: 'Ted' }],
    }

    it('should support optional dependencies in resultFunction', () => {
      const setup = (externalSelectors) => {
        const { selectors } = createRedux({
          createLogger,
          selectorDefinitions: [
            {
              id: 'animals',
              resultFunction: (bats, cats = []) => [...bats, ...cats],
              dependencies: [
                { module: 'external', selector: 'bats' },
                { module: 'external', selector: 'cats', optional: true },
              ],
            },
          ],
          externalSelectors,
        })

        return selectors
      }

      const selectorsWithoutCats = setup([batsSelector])
      expect(selectorsWithoutCats.batmobile.animals()).toEqual([{ name: 'Bill' }])

      expect(() => setup([catsSelector])).toThrow(/dependency not found/)

      const selectorsWithCats = setup([batsSelector, catsSelector])
      expect(selectorsWithCats.batmobile.animals()).toEqual([{ name: 'Bill' }, { name: 'Ted' }])
    })

    it('should support optional dependencies in selectorFactory', () => {
      const setup = (externalSelectors) => {
        const { selectors } = createRedux({
          createLogger,
          selectorDefinitions: [
            {
              id: 'animals',
              selectorFactory: (batsSelector, catsSelector) =>
                createSelector(
                  batsSelector,
                  catsSelector.isFallback ? () => [{ name: 'Balthasar' }] : catsSelector,
                  (bats, cats) => [...bats, ...cats]
                ),
              dependencies: [
                { module: 'external', selector: 'bats' },
                { module: 'external', selector: 'cats', optional: true },
              ],
            },
          ],
          externalSelectors,
        })

        return selectors
      }

      const selectorsWithoutCats = setup([batsSelector])
      expect(selectorsWithoutCats.batmobile.animals()).toEqual([
        { name: 'Bill' },
        { name: 'Balthasar' },
      ])

      expect(() => setup([catsSelector])).toThrow(/dependency not found/)

      const selectorsWithCats = setup([batsSelector, catsSelector])
      expect(selectorsWithCats.batmobile.animals()).toEqual([{ name: 'Bill' }, { name: 'Ted' }])
    })
  })
})
