import { filter } from '@exodus/atoms'
import { WalletAccount } from '@exodus/models'

export default function createWalletAccountsAtom({ walletAccountsInternalAtom }) {
  return filter(walletAccountsInternalAtom, (value) => !!value[WalletAccount.DEFAULT_NAME]?.seedId)
}
