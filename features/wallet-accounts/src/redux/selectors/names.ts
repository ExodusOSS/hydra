import type { WalletAccount } from '@exodus/models'

// see initialState.data
const resultFunction = (data: Record<string, WalletAccount>) => Object.keys(data)

const namesSelector = {
  id: 'names',
  resultFunction,
  dependencies: [
    //
    { selector: 'data' },
  ],
} as const

export default namesSelector
