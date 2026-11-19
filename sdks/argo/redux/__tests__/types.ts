import type { ReduxModuleDefinition } from '@exodus/redux-dependency-injection'

import createReduxIOC from '../index.js'

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
  ],
} as const satisfies ReduxModuleDefinition

const arkhamAsylum = {
  id: 'arkhamAsylum',
  type: 'redux-module',
  initialState: { secure: true },
  eventReducers: {},
  selectorDefinitions: [
    {
      id: 'jokerAdmitted',
      resultFunction: () => new Date(1991, 0, 1),
      dependencies: [],
    },
  ],
} as const satisfies ReduxModuleDefinition

// Each `use(module)` accumulates the module's selectors onto `resolve().selectors`.
const { selectors } = createReduxIOC({ actionCreators: {}, reducers: {} })
  .use(wayneFoundation)
  .use(arkhamAsylum)
  .resolve()

const state: any = {}

const blueprints: string = selectors.wayneFoundation.batmobile(state)
const jokerAdmitted: Date = selectors.arkhamAsylum.jokerAdmitted(state)
// selectors are also generated from initial state
const secure: boolean = selectors.arkhamAsylum.secure(state)

// @ts-expect-error -- selector belongs to a module that was never `use`d
void selectors.gotham

// @ts-expect-error -- selector does not exist on the module
void selectors.wayneFoundation.batpod

// @ts-expect-error -- wrong return type
const blueprintsNumber: number = selectors.wayneFoundation.batmobile(state)

void blueprints
void jokerAdmitted
void secure
void blueprintsNumber
