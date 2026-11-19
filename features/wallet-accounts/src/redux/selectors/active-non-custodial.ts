import { defineSelectorResultFunction } from '@exodus/redux-dependency-injection'
import { WalletAccount } from '@exodus/models'

const resultFunction = (active: string, activeIsCustodial: boolean): string =>
  activeIsCustodial ? WalletAccount.DEFAULT_NAME : active

export default defineSelectorResultFunction({
  id: 'activeNonCustodial',
  resultFunction,
  dependencies: [
    //
    { selector: 'active' },
    { selector: 'activeIsCustodial' },
  ],
})
