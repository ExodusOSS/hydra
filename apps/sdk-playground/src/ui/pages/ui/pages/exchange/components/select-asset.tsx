import WalletAccount from './wallet-account'

const NETWORK_TICKERS = {
  solana: 'SOL',
  ethereum: 'ETH',
  bitcoin: 'BTC',
}

const SelectAsset = ({
  side,
  assets,
  query,
  walletAccount,
  walletAccounts,
  onQueryChange,
  onSelect,
  onWalletAccountChange,
}) => {
  const title = side === 'from' ? 'From Asset' : 'To Asset'

  const options = query ? assets.search : assets.all

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
      <div className="relative flex h-[460px] w-[80%] flex-col rounded-md bg-[#282a44] p-4 text-white shadow-sm">
        <p className="mb-4 border-b border-b-slate-700 pb-2 text-center">{title}</p>

        <button className="absolute right-4 top-3" onClick={() => onSelect(null)}>
          x
        </button>

        <div className="mb-4 flex gap-2">
          <input
            type="text"
            className="w-full rounded-md border border-slate-700 bg-transparent p-2 text-sm outline-none ring-0 focus:ring-0"
            value={query}
            placeholder="Search Asset"
            onChange={(e) => onQueryChange(e.target.value)}
          />

          <div className="flex items-center gap-2">
            {walletAccounts.map((value) => (
              <WalletAccount
                key={value.toString()}
                walletAccount={value}
                className="!m-0 !rounded-full"
                size="small"
                active={value.toString() === walletAccount.toString()}
                onPress={() => onWalletAccountChange(value)}
              />
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-scroll">
          {options.map((option) => (
            <button
              className="mb-2 flex w-full items-center justify-between text-sm"
              key={option.id}
              onClick={(e) => {
                e.stopPropagation()
                onSelect({ asset: option })
              }}
            >
              <div>
                {option.displayName}{' '}
                <span className="opacity-50">({NETWORK_TICKERS[option.baseAssetName]})</span>
              </div>

              <div className="text-right opacity-50">
                {option.amount.toFixed(5)} {option.displayTicker}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SelectAsset
