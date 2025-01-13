import { WalletAccount } from '@exodus/models'

const resultFunction = (active, activeIsCustodial) =>
  activeIsCustodial ? WalletAccount.DEFAULT_NAME : active

// eslint-disable-next-line @exodus/export-default/named
export default {
  id: 'activeNonCustodial',
  resultFunction,
  dependencies: [
    //
    { selector: 'active' },
    { selector: 'activeIsCustodial' },
  ],
}
