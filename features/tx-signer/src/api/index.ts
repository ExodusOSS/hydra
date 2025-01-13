import type {
  ISignedTransaction,
  ITransactionSigner,
  SignTransactionParams,
} from '../module/interfaces.js'
import type { Definition } from '@exodus/dependency-types'
import type { WalletAccount } from '@exodus/models'
import type { Atom } from '@exodus/atoms'
import assert from 'minimalistic-assert'

type SignTransactionApiParams = Omit<SignTransactionParams, 'walletAccount'> & {
  walletAccount: WalletAccount | string
}

export interface TransactionSignerApi {
  transactionSigner: {
    /**
     * Signs a transaction for a given wallet account and asset
     */
    signTransaction(params: SignTransactionApiParams): Promise<ISignedTransaction>
  }
}

type Dependencies = {
  transactionSigner: ITransactionSigner
  walletAccountsAtom: Atom<Record<string, WalletAccount>>
}

const createTransactionSignerApi = ({
  transactionSigner,
  walletAccountsAtom,
}: Dependencies): TransactionSignerApi => {
  const getWalletAccount = async (name: string): Promise<WalletAccount> => {
    const walletAccounts = await walletAccountsAtom.get()
    const walletAccount = walletAccounts[name]
    assert(walletAccount, `Unknown wallet account: ${name}`)
    return walletAccount
  }

  return {
    transactionSigner: {
      signTransaction: async (params: SignTransactionApiParams) => {
        const walletAccount =
          typeof params.walletAccount === 'string'
            ? await getWalletAccount(params.walletAccount)
            : params.walletAccount

        return transactionSigner.signTransaction({ ...params, walletAccount })
      },
    },
  }
}

const transactionSignerApiDefinition = {
  id: 'transactionSignerApi',
  type: 'api',
  factory: createTransactionSignerApi,
  dependencies: ['transactionSigner', 'walletAccountsAtom'],
} as const satisfies Definition

export default transactionSignerApiDefinition
