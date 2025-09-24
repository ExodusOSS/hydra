import type { WalletAccount } from '@exodus/models'
import { useSelector } from 'react-redux'

import selectors from '@/ui/flux/selectors'
import { cn } from '@/ui/utils/classnames'
import exodus from '@/background'

function Actions() {
  const walletAccounts: WalletAccount[] = useSelector(selectors.walletAccounts.all)
  const activeWalletAccount: string = useSelector(selectors.walletAccounts.active)

  return (
    <div className="mt-8 flex flex-col">
      <h2>Actions</h2>

      <h3 className="mt-2 text-sm">Active Wallet Account</h3>

      <div className="mt-2 flex gap-2">
        {walletAccounts.map((walletAccount) => {
          const walletAccountName = walletAccount.toString()
          const isActive = walletAccountName === activeWalletAccount

          return (
            <button
              key={walletAccountName}
              className={cn(
                'rounded border p-1 text-sm',
                isActive ? 'border-white' : 'border-gray-500 text-gray-500'
              )}
              onClick={() => exodus.walletAccounts.setActive(walletAccountName)}
            >
              {walletAccountName}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default Actions
