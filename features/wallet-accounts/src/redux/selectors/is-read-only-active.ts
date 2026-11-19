import { defineSelectorResultFunction } from '@exodus/redux-dependency-injection'

const resultFunction = (
  activeWalletAccount: string,
  isReadOnly: (name: string) => boolean
): boolean => isReadOnly(activeWalletAccount)

const isReadOnlySelector = defineSelectorResultFunction({
  id: 'isReadOnlyActive',
  resultFunction,
  dependencies: [
    //
    { selector: 'active' },
    { selector: 'isReadOnly' },
  ],
})

export default isReadOnlySelector
