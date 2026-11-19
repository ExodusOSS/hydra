import { defineSelectorResultFunction } from '@exodus/redux-dependency-injection'
import type { WalletAccount } from '@exodus/models'

// see initialState.data
const resultFunction = (data: Record<string, WalletAccount>): string[] => Object.keys(data)

const namesSelector = defineSelectorResultFunction({
  id: 'names',
  resultFunction,
  dependencies: [
    //
    { selector: 'data' },
  ],
})

export default namesSelector
