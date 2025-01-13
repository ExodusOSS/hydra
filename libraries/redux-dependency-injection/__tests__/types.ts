import type { ReduxModuleDefinition } from '../src/index.js'
import { setupRedux } from '../src/index.js'

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
  data: Record<string, any> | undefined
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
  initialState: { bruceWayne: 'is batman' },
})

const state: any = {}

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
const data: Record<string, any> = selectors.arkhamAsylum.data(state)

const dataPossiblyUndefined: Record<string, any> | undefined = selectors.arkhamAsylum.data(state)

// selector with multiple dependencies should accept state as only param
const jokerInsanity: number = selectors.arkhamAsylum.jokerInsanity(state)

// initial state
const initialSecure: boolean = initialState.arkhamAsylum.secure

// @ts-expect-error -- doesn't exist on initial state
const someState = initialState.dontExist

// merges with base initial state
const bruceWayneIdentity: string = initialState.bruceWayne

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
