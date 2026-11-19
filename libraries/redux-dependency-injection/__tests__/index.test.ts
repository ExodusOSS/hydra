import { createSelector } from 'reselect'

import type { ReduxModuleDefinition } from '../src/index.js'
import {
  defineReduxModule,
  defineSelectorFactory,
  defineSelectorResultFunction,
  setupRedux,
} from '../src/index.js'
import { createRedux } from './setup.js'

describe('redux-dependency-injection', () => {
  type BatmobileState = {
    speed: number
    price: number
  }

  type BatmobileRootState = {
    batmobile: BatmobileState
  }

  it('should handle events and actions', () => {
    const { store, handleEvent } = createRedux({
      eventReducers: {
        upgrade: (state, payload: { speed: number }) => ({ ...state, speed: payload.speed }),
      },
      actionReducers: {
        SET_PRICE: (state, payload: number) => ({ ...state, price: payload }),
      },
    })

    handleEvent('upgrade', { speed: 500 })
    expect(store.getState()).toEqual({ batmobile: { speed: 500 } })

    store.dispatch({ type: 'SET_PRICE', payload: 42 })
    expect(store.getState()).toEqual({ batmobile: { speed: 500, price: 42 } })
  })

  it('should generate a logger selector', () => {
    const info = jest.fn()
    const createLogger = jest.fn(
      () =>
        ({
          info,
          debug: jest.fn(),
          error: jest.fn(),
          trace: jest.fn(),
          log: jest.fn(),
          warn: jest.fn(),
        }) as const
    )
    const { selectors, store } = createRedux({
      createLogger,
      selectorDefinitions: [
        {
          id: 'driver',
          resultFunction: (logger: { info: (message: string) => void }) => {
            logger.info('Driver of batmobile revealed')
            return 'Bruce Wayne'
          },
          dependencies: [{ selector: 'logger' }],
        },
      ],
    })

    selectors.batmobile.driver(store.getState())

    expect(info).toHaveBeenCalledWith('Driver of batmobile revealed')
    expect(createLogger).toHaveBeenCalledWith('exodus:batmobile:redux')
  })

  describe('optional dependencies', () => {
    const createLogger = () =>
      ({
        info: () => {},
        debug: () => {},
        error: () => {},
        trace: () => {},
        log: () => {},
        warn: () => {},
      }) as const
    const batsSelector = {
      id: 'external.selectors.bats',
      factory: () => () => [{ name: 'Bill' }],
    }

    const catsSelector = {
      id: 'external.selectors.cats',
      factory: () => () => [{ name: 'Ted' }],
    }

    it('should support optional dependencies in resultFunction', () => {
      const setup = (
        externalSelectors: readonly { id: string; factory: () => () => { name: string }[] }[]
      ) => {
        return createRedux({
          createLogger,
          selectorDefinitions: [
            {
              id: 'animals',
              resultFunction: (bats: { name: string }[], cats: { name: string }[] = []) => [
                ...bats,
                ...cats,
              ],
              dependencies: [
                { module: 'external', selector: 'bats' },
                { module: 'external', selector: 'cats', optional: true },
              ],
            },
          ],
          externalSelectors,
        })
      }

      const withoutCats = setup([batsSelector])
      expect(withoutCats.selectors.batmobile.animals(withoutCats.store.getState())).toEqual([
        { name: 'Bill' },
      ])

      expect(() => setup([catsSelector])).toThrow(/dependency not found/)

      const withCats = setup([batsSelector, catsSelector])
      expect(withCats.selectors.batmobile.animals(withCats.store.getState())).toEqual([
        { name: 'Bill' },
        { name: 'Ted' },
      ])
    })

    it('should support optional dependencies in selectorFactory', () => {
      const setup = (
        externalSelectors: readonly { id: string; factory: () => () => { name: string }[] }[]
      ) => {
        return createRedux({
          createLogger,
          selectorDefinitions: [
            {
              id: 'animals',
              selectorFactory: (
                batsSelector: (state: unknown) => { name: string }[],
                catsSelector: ((state: unknown) => { name: string }[]) & { isFallback?: boolean }
              ) =>
                createSelector(
                  batsSelector,
                  catsSelector.isFallback ? () => [{ name: 'Balthasar' }] : catsSelector,
                  (bats: { name: string }[], cats: { name: string }[]) => [...bats, ...cats]
                ),
              dependencies: [
                { module: 'external', selector: 'bats' },
                { module: 'external', selector: 'cats', optional: true },
              ],
            },
          ],
          externalSelectors,
        })
      }

      const withoutCats = setup([batsSelector])
      expect(withoutCats.selectors.batmobile.animals(withoutCats.store.getState())).toEqual([
        { name: 'Bill' },
        { name: 'Balthasar' },
      ])

      expect(() => setup([catsSelector])).toThrow(/dependency not found/)

      const withCats = setup([batsSelector, catsSelector])
      expect(withCats.selectors.batmobile.animals(withCats.store.getState())).toEqual([
        { name: 'Bill' },
        { name: 'Ted' },
      ])
    })
  })

  describe('helper parity', () => {
    const eventReducers = {
      upgrade: (state: BatmobileState, payload: { speed: number }) => ({
        ...state,
        speed: payload.speed,
      }),
    }
    const actionReducers = {
      SET_PRICE: (state: BatmobileState, payload: number) => ({ ...state, price: payload }),
    }

    const literalModuleDefinition = {
      id: 'batmobile',
      type: 'redux-module',
      initialState: { speed: 0, price: 0 },
      eventReducers,
      actionReducers,
      selectorDefinitions: [
        {
          id: 'summary',
          resultFunction: (speed: number, price: number) => `${speed}:${price}`,
          dependencies: [{ selector: 'speed' }, { selector: 'price' }],
        },
        {
          id: 'isFast',
          selectorFactory: (speedSelector: (state: BatmobileRootState) => number) =>
            createSelector(speedSelector, (speed: number) => speed > 500),
          dependencies: [{ selector: 'speed' }],
        },
      ],
    } as const satisfies ReduxModuleDefinition

    const helperModuleDefinition = defineReduxModule({
      id: 'batmobile',
      initialState: { speed: 0, price: 0 },
      eventReducers,
      actionReducers,
      selectorDefinitions: [
        defineSelectorResultFunction({
          id: 'summary',
          resultFunction: (speed: number, price: number) => `${speed}:${price}`,
          dependencies: [{ selector: 'speed' }, { selector: 'price' }],
        }),
        defineSelectorFactory({
          id: 'isFast',
          selectorFactory: (speedSelector: (state: BatmobileRootState) => number) =>
            createSelector(speedSelector, (speed: number) => speed > 500),
          dependencies: [{ selector: 'speed' }],
        }),
      ],
    })

    it('should match literal module behavior at runtime', () => {
      const literal = createRedux({
        moduleDefinition: literalModuleDefinition,
      })
      const helper = createRedux({
        moduleDefinition: helperModuleDefinition,
      })

      literal.handleEvent('upgrade', { speed: 600 })
      helper.handleEvent('upgrade', { speed: 600 })
      literal.store.dispatch({ type: 'SET_PRICE', payload: 42 })
      helper.store.dispatch({ type: 'SET_PRICE', payload: 42 })

      const literalState = literal.store.getState()
      const helperState = helper.store.getState()

      expect(helper.store.getState()).toEqual(literal.store.getState())
      expect(helper.selectors.batmobile.summary(helperState)).toEqual(
        literal.selectors.batmobile.summary(literalState)
      )
      expect(helper.selectors.batmobile.isFast(helperState)).toEqual(
        literal.selectors.batmobile.isFast(literalState)
      )
    })

    it('should fail on missing helper dependency ids like literal definitions', () => {
      const invalidHelperModule = defineReduxModule({
        id: 'batmobile',
        initialState: { speed: 0 },
        eventReducers: {},
        selectorDefinitions: [
          defineSelectorResultFunction({
            id: 'badSelector',
            resultFunction: (value: number) => value,
            dependencies: [{ selector: 'speedTypo' }],
          }),
        ],
      })

      expect(() =>
        createRedux({
          moduleDefinition: invalidHelperModule,
        })
      ).toThrow(/dependency not found/)
    })
  })

  it('should reject the removed `initialState` parameter', () => {
    // Excess-property checks don't fire on generic-constrained params, so
    // there's no compile-time error to suppress here. The runtime guard is
    // what catches JS callers and any-typed wrappers that slip through.
    expect(() => setupRedux({ dependencies: [], initialState: {} } as never)).toThrow(
      /`initialState` parameter has been removed/
    )
  })
})
