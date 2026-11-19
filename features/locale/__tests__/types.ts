import type { UnitType } from '@exodus/currency'
import { setupRedux } from '@exodus/redux-dependency-injection'

import localeReduxDefinition from '../redux/index.js'

const { selectors, initialState } = setupRedux({
  dependencies: [localeReduxDefinition],
})

const state: any = {}

const locale: string = selectors.locale.language(state)
const currency: string = selectors.locale.currency(state)
const unitType: UnitType = selectors.locale.currencyUnitType(state)

// @ts-expect-error -- this selector does not exist and should result in a compile error
const nonExistentSelector = selectors.locale.nonExistentSelector(state)

// @ts-expect-error -- wrong type
const localeNumber: number = selectors.locale.language(state)
// @ts-expect-error -- wrong type
const currencyNumber: number = selectors.locale.currency(state)
// @ts-expect-error -- wrong type
const unitTypeNumber: number = selectors.locale.currencyUnitType(state)

// Has properties on initial state
const initial = {
  language: initialState.locale.language,
  languageLoaded: initialState.locale.languageLoaded,
  currency: initialState.locale.currency,
  currencyLoaded: initialState.locale.currencyLoaded,
  // @ts-expect-error -- fails on accessing a property that does not exist
  other: initialState.locale.other,
}
