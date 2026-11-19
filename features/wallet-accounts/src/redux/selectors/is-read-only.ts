import { defineSelectorResultFunction } from '@exodus/redux-dependency-injection'
import type { WalletAccount } from '@exodus/models'

const isReadOnlySelectorFactory =
  ({ readOnlyHardwareModels = [] }: { readOnlyHardwareModels?: string[] }) =>
  (getWalletAccount: (name: string) => WalletAccount | undefined) =>
  (name: string): boolean => {
    const walletAccount = getWalletAccount(name)

    return walletAccount?.model ? readOnlyHardwareModels.includes(walletAccount.model) : false
  }

const createIsReadOnlySelectorDefinition = (config: { readOnlyHardwareModels?: string[] }) =>
  defineSelectorResultFunction({
    id: 'isReadOnly',
    resultFunction: isReadOnlySelectorFactory(config),
    dependencies: [
      //
      { selector: 'get' },
    ],
  })

export default createIsReadOnlySelectorDefinition
