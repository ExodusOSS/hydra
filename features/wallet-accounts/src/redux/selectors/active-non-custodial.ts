import { WalletAccount } from '@exodus/models'

const resultFunction = (active: string, activeIsCustodial: boolean) =>
  activeIsCustodial ? WalletAccount.DEFAULT_NAME : active

export default {
  id: 'activeNonCustodial',
  resultFunction,
  dependencies: [
    //
    { selector: 'active' },
    { selector: 'activeIsCustodial' },
  ],
} as const
