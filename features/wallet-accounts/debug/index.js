import { WalletAccount } from '@exodus/models'

const createWalletAccountsDebug = ({
  walletAccounts,
  walletAccountsAtom,
  allWalletAccountsEver,
}) => {
  const enableAll = async () => {
    const instances = await walletAccountsAtom.get()
    const toEnable = Object.keys(instances)
    await walletAccounts.enableMany(toEnable)
  }

  const disableAll = async () => {
    const instances = await walletAccountsAtom.get()
    const toDisable = Object.keys(instances).filter((it) => it !== WalletAccount.DEFAULT_NAME)
    await walletAccounts.disableMany(toDisable)
  }

  return {
    walletAccounts: {
      enableAll,
      disableAll,
      getAllWalletAccountsEver: allWalletAccountsEver.get,
    },
  }
}

const walletAccountsDebugDefinition = {
  id: 'walletAccountsDebug',
  type: 'debug',
  factory: createWalletAccountsDebug,
  dependencies: ['walletAccounts', 'walletAccountsAtom', 'allWalletAccountsEver'],
  public: true,
}

export default walletAccountsDebugDefinition
