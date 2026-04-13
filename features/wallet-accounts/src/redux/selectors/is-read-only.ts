import type { WalletAccount } from '@exodus/models'

const isReadOnlySelectorFactory =
  ({ readOnlyHardwareModels = [] }: { readOnlyHardwareModels?: string[] }) =>
  (getWalletAccount: (name: string) => WalletAccount | undefined) =>
  (name: string) => {
    const walletAccount = getWalletAccount(name)

    return walletAccount?.model ? readOnlyHardwareModels.includes(walletAccount.model) : false
  }

const createIsReadOnlySelectorDefinition = (config: { readOnlyHardwareModels?: string[] }) => ({
  id: 'isReadOnly',
  resultFunction: isReadOnlySelectorFactory(config),
  dependencies: [
    //
    { selector: 'get' },
  ],
})

export default createIsReadOnlySelectorDefinition
