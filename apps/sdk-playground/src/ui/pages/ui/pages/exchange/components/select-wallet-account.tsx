const SelectWalletAccount = ({ walletAccounts, onSelect }) => {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-black/50"
      onClick={() => onSelect(null)}
    >
      <div className="flex max-h-96 w-[80%] flex-col rounded-md bg-[#282a44] p-4 text-white shadow-sm">
        <p className="mb-4 border-b border-b-slate-700 pb-2 text-center">Wallet Accounts</p>

        <div className="flex-1  overflow-scroll">
          {walletAccounts.map((option) => (
            <button
              className="mb-2 block"
              key={option.toString()}
              onClick={(e) => {
                e.stopPropagation()
                onSelect({ walletAccount: option })
              }}
            >
              {option.toString()}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SelectWalletAccount
