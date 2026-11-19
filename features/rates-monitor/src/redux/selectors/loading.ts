import type { SelectorDefinition } from '@exodus/redux-dependency-injection'

const resultFunction = (loaded: boolean) => !loaded

const loadingSelector = {
  id: 'loading',
  resultFunction,
  dependencies: [
    //
    { selector: 'loaded' },
  ],
} as const satisfies SelectorDefinition

export default loadingSelector
