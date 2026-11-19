import type { ReduxModuleDefinition } from '@exodus/redux-dependency-injection'

import createExodusRedux from '../redux/index.js'

// A module registered by the consumer (not built into headless).
const favoriteAssets = {
  id: 'favoriteAssets',
  type: 'redux-module',
  eventReducers: {},
  selectorDefinitions: [
    {
      id: 'list',
      resultFunction: () => ['btc', 'eth'],
      dependencies: [],
    },
  ],
} as const satisfies ReduxModuleDefinition

const { selectors } = createExodusRedux({ actionCreators: {}, reducers: {} })
  .use(favoriteAssets)
  .resolve()

const state: any = {}

// Built-in modules that are already typed contribute precise selectors to
// `resolve().selectors` (previously the whole object was `unknown`).
const language: string = selectors.locale.language(state)
void selectors.assets.all(state)
void selectors.remoteConfig.get

// A consumer-registered module's selectors are typed too.
const favorites: string[] = selectors.favoriteAssets.list(state)

// @ts-expect-error -- wrong return type: locale.language is a string, not a number
const languageNumber: number = selectors.locale.language(state)

// @ts-expect-error -- selector does not exist on the locale module
void selectors.locale.thisSelectorDoesNotExist

// @ts-expect-error -- geolocation is registered at runtime but still untyped JS,
// so it is intentionally absent from the typed union until it ships selector types.
void selectors.geolocation

void language
void favorites
void languageNumber
