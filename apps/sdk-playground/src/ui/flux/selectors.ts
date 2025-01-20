import { selectors as defaultSelectors } from './index.js'

// FIX: Make sure types are correctly inferred here
const typedSelectors = defaultSelectors as Record<any, any>

const selectors: Record<any, any> = {
  ...typedSelectors,
  assets: {
    ...typedSelectors.assets,
    moneroIsOutOfDate: () => false,
    algoMustOptIn: () => false,
  },
}

export default selectors
