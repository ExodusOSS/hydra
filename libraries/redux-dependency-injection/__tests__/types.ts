import type {
  ContainerDependency,
  ReduxModuleDefinition,
  SelectorDefinition,
  SetupReduxState,
} from '../src/index.js'
import {
  defineReduxModule,
  defineSelectorFactory,
  defineSelectorResultFunction,
  setupRedux,
} from '../src/index.js'

const wayneFoundation = {
  id: 'wayneFoundation',
  type: 'redux-module',
  eventReducers: {},
  selectorDefinitions: [
    {
      id: 'batmobile',
      resultFunction: () => 'Secret batmobile blueprints',
      dependencies: [],
    },
    {
      id: 'wayneManor',
      resultFunction: () => 'The Wayne Manor',
      dependencies: [],
    },
    {
      id: 'batcave',
      selectorFactory: (batmobileSelector) => () => 42,
      dependencies: [{ selector: 'batmobile' }],
    },
  ],
} as const satisfies ReduxModuleDefinition

type ArkhamInitialState = {
  data: Record<string, unknown> | undefined
  secure: boolean
}

const arkhamAsylum = {
  id: 'arkhamAsylum',
  type: 'redux-module',
  initialState: {
    data: undefined,
    secure: true,
  } as ArkhamInitialState,
  eventReducers: {},
  selectorDefinitions: [
    {
      id: 'jokerAdmitted',
      resultFunction: () => new Date(1991, 0, 1),
      dependencies: [],
    },
    {
      id: 'jokerInsanity',
      resultFunction: (jokerAdmitted: boolean, data: ArkhamInitialState['data']) => 73,
      dependencies: [{ selector: 'jokerAdmitted' }, { selector: 'data' }],
    },
  ],
} as const satisfies ReduxModuleDefinition

const { selectors, initialState } = setupRedux({
  dependencies: [wayneFoundation, arkhamAsylum],
})

const state = {} as typeof initialState

const batmobileBlueprints: string = selectors.wayneFoundation.batmobile(state)
const batcar: number = selectors.wayneFoundation.batcave()

const jokerAdmitted: Date = selectors.arkhamAsylum.jokerAdmitted(state)

// @ts-expect-error -- this selector does not exist and should throw an error
const doesnNotExist: string = selectors.other.doesntExist(state)

// @ts-expect-error -- wrong type
const batmobileBool: boolean = selectors.wayneFoundation.batmobile(state)

// selectors generated from initial state
const secure: boolean = selectors.arkhamAsylum.secure(state)

// @ts-expect-error -- wrong type, can be undefined
const data: Record<string, unknown> = selectors.arkhamAsylum.data(state)

const dataPossiblyUndefined: Record<string, unknown> | undefined =
  selectors.arkhamAsylum.data(state)

// selector with multiple dependencies should accept state as only param
const jokerInsanity: number = selectors.arkhamAsylum.jokerInsanity(state)

// initial state
const initialSecure: boolean = initialState.arkhamAsylum.secure

// @ts-expect-error -- doesn't exist on initial state
const someState = initialState.dontExist

type BatcaveState = {
  batmobile?: string
  wayneManor?: string
  batcave?: number
}

const batcave = {
  id: 'batcave',
  type: 'redux-module',
  initialState: {
    batmobile: 'The Batmobile',
    // @ts-expect-error -- property doesn't exist on state
    other: 123,
  },
  eventReducers: {
    // @ts-expect-error -- reducer doesn't return state
    updateBatmobile: (state: BatcaveState, payload: string) => payload,
    // @ts-expect-error -- reducer receives invalid state
    updateWaynemanor: (state: number, payload: string) => ({}),
    updateBatcave: (state: BatcaveState, payload: number) => ({ ...state, batcave: payload }),
  },
  selectorDefinitions: [],
} as const satisfies ReduxModuleDefinition<BatcaveState>

const helperFactorySelector = defineSelectorFactory({
  id: 'doubleCount',
  selectorFactory: (countSelector: CountSelector) =>
    (state: Record<string, unknown>) =>
      countSelector(state) * 2,
  dependencies: [{ selector: 'count' }],
})

const helperResultSelector = defineSelectorResultFunction({
  id: 'isPositive',
  resultFunction: (count: number) => count > 0,
  dependencies: [{ selector: 'count' }],
})

const helperInitialState: { count: number } = {
  count: 0,
}

const inferredHelpersModule = defineReduxModule({
  id: 'helperModule',
  initialState: helperInitialState,
  eventReducers: {},
  selectorDefinitions: [helperFactorySelector, helperResultSelector],
})

const inferredSetup = setupRedux({
  dependencies: [inferredHelpersModule],
})
const inferredState = {} as typeof inferredSetup.initialState

const doubledCount: number = inferredSetup.selectors.helperModule.doubleCount(inferredState)
const isPositive: boolean = inferredSetup.selectors.helperModule.isPositive(inferredState)

defineReduxModule({
  id: 'withType',
  // @ts-expect-error -- helper should add redux module type internally
  type: 'redux-module',
  eventReducers: {},
  selectorDefinitions: [],
})

const literalIdModule = defineReduxModule({
  id: 'gcpd',
  initialState: {
    loaded: false,
  },
  eventReducers: {},
  selectorDefinitions: [
    defineSelectorResultFunction({
      id: 'isLoaded',
      resultFunction: (loaded: boolean) => loaded,
      dependencies: [{ selector: 'loaded' }],
    }),
  ],
})

const literalIdSetup = setupRedux({
  dependencies: [literalIdModule],
})

const literalIdState = {} as typeof literalIdSetup.initialState
const gcpdLoaded: boolean = literalIdSetup.selectors.gcpd.isLoaded(literalIdState)

// @ts-expect-error -- literal module id should be preserved
const missingLiteralNamespace = literalIdSetup.selectors.gordon.isLoaded(literalIdState)

const noInitialStateModule = defineReduxModule({
  id: 'noInitialState',
  eventReducers: {},
  selectorDefinitions: [
    defineSelectorResultFunction({
      id: 'alwaysTrue',
      resultFunction: () => true,
      dependencies: [],
    }),
  ],
})

const noInitialStateSetup = setupRedux({
  dependencies: [noInitialStateModule],
})
const noInitialStateState = {} as typeof noInitialStateSetup.initialState
const alwaysTrue: boolean = noInitialStateSetup.selectors.noInitialState.alwaysTrue(
  noInitialStateState
)

// @ts-expect-error -- literal module id should be preserved when initialState is omitted
const missingNoInitialNamespace = noInitialStateSetup.selectors.notIt.alwaysTrue(
  noInitialStateState
)

// --- widened selector-id guard ---
// A module whose selectorDefinitions element has a widened `id: string` (the
// common failure mode when a source file drops `as const` or forgets to wrap
// with defineSelector*). setupRedux must reject this at the call site — without
// the guard, the call silently succeeds and per-key selector inference collapses
// to a union across every selector + `undefined`.
const widenedSelectorDef = {
  id: 'widenedSelector' as string,
  resultFunction: () => 42,
  dependencies: [],
} as const

const widenedIdModule = {
  id: 'widenedIdModule',
  type: 'redux-module',
  eventReducers: {},
  selectorDefinitions: [widenedSelectorDef],
} as const satisfies ReduxModuleDefinition

// @ts-expect-error -- selectorDefinitions[].id is widened to `string`; setupRedux must refuse.
const widenedSetup = setupRedux({ dependencies: [widenedIdModule] })
void widenedSetup

// A second failure mode: an explicit `: SelectorDefinition` annotation on a
// selector also widens `id` to `string`, but the surrounding module produces
// `selectorDefinitions: readonly [SelectorDefinition]` — a tuple, not the base
// array. The guard discriminates on that array shape, so the tuple form must
// still be flagged.
const annotatedSelectorDef: SelectorDefinition = {
  id: 'annotatedSelector',
  resultFunction: () => 1,
  dependencies: [],
}

const annotatedIdModule = {
  id: 'annotatedIdModule',
  type: 'redux-module',
  eventReducers: {},
  selectorDefinitions: [annotatedSelectorDef],
} as const satisfies ReduxModuleDefinition

// @ts-expect-error -- annotated selector widens id to string; setupRedux must refuse.
const annotatedSetup = setupRedux({ dependencies: [annotatedIdModule] })
void annotatedSetup

// --- SetupReduxState: literal module ids survive widened union arms ---
// Regression test for PR #16561. Several test fixtures across the repo cast
// deps through `as ContainerDependency` to satisfy the array element type when
// the underlying JS-only module imports widen `type` to `string`. That widening
// flows into `dependencies[number]` as a bare `ContainerDependency` arm, and
// any non-distributive computation of `InitialState` collapses literal ids to
// `string`, dropping the module's slice key. `SetupReduxState` must keep the
// literal key even when a widened arm is present.

type LiteralModuleDep = {
  id: 'literalSlice'
  type: 'redux-module'
  initialState: { count: number }
  eventReducers: Record<string, never>
  selectorDefinitions: []
}

type StateWithWidenedNeighbour = SetupReduxState<{
  dependencies: (LiteralModuleDep | ContainerDependency)[]
}>

declare const stateWithWidenedNeighbour: StateWithWidenedNeighbour
const widenedNeighbourCount: number = stateWithWidenedNeighbour.literalSlice.count
void widenedNeighbourCount

// --- SetupReduxState: empty / module-less deps fall back to an empty object ---
// Without an explicit fallback, `UnionToIntersection<never>` widens to
// `unknown`, leaking through to `initialState` and the reducer signature.
// Match the runtime (`buildInitialState` returns `{}` here) by pinning the
// type to `Record<string, never>` whenever there are no redux-module arms.

type AssertEqual<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false

const emptyDepsSetup = setupRedux({ dependencies: [] })
const emptyDepsStateIsEmpty: AssertEqual<typeof emptyDepsSetup.initialState, Record<string, never>> =
  true
void emptyDepsStateIsEmpty

type CountSelector = (state: Record<string, unknown>) => number
