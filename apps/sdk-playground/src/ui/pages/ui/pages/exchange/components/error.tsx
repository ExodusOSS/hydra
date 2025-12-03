const MustOptInError = () => {
  return `You must opt-in before swapping`
}

const LowAlgorandError = ({ payload = {} }: { payload: any }) => {
  const ticker = payload.fromAsset?.feeAsset.displayTicker
  const feeAmount = payload.fee.toDefaultString()
  return `The Algorand network requires a small amount of ALGO to start this swap. You need at least{' '}
      ${payload.fromAccountReserve} ${ticker} in reserve and ${feeAmount} in your wallet
      then try again.`
}

const LowSolanaRentExemptAmount = ({ payload = {} }: { payload: any }) => {
  const ticker = payload.fromAsset?.feeAsset.displayTicker
  const rentExemptAmount = payload.rentExemptAmount.toDefaultString()

  return `You can either leave a zero balance change, which will close your SOL account, or maintain a minimum balance of ${rentExemptAmount} ${ticker} to keep it active.`
}

const ZeroBalanceError = ({ payload = {} }: { payload: any }) => {
  const ticker = payload.asset.displayTicker
  return `Balance too low. Add ${ticker} to continue.`
}

const NotEnoughBalanceError = ({ payload = {} }: { payload: any }) => {
  const ticker = payload.asset.displayTicker
  const prefillId = payload.prefillId

  return !prefillId || prefillId === 'min'
    ? `Balance too low. Add more ${ticker} to continue.`
    : `Minimum swap is currently ${payload.min.toDefaultString()}. Add more ${ticker} to continue.`
}

const ExactOutQuoteError = ({ payload = {} }: { payload: any }) => {
  const ticker = payload.fromAsset.displayTicker

  return `Please enter the amount of ${ticker} you'd like to swap to continue.`
}

const LowFromAmountError = ({ payload = {} }: { payload: any }) => {
  const ticker = payload.asset.displayTicker
  return `Minimum swap is currently ${payload.min.toDefaultString()}. Add more ${ticker} to continue.`
}

const HighFromAmountError = ({ payload = {} }: { payload: any }) => {
  const ticker = payload.asset.displayTicker
  const limit = payload.limits.max.toDefaultString()
  return `The amount is higher than the swap maximum of ${limit} ${ticker}.`
}

const NotEnoughFeeBalanceError = ({ payload = {} }: { payload: any }) => {
  const feeAmount = payload.fee.toDefaultString()
  const feeTicker = payload.fromAsset.feeAsset.displayTicker
  return `It's recommended you have at least ${feeAmount} ${feeTicker} so you can pay the fee`
}

const PairUnavailableError = () => {
  return `Swap is temporarily unavailable for this pair. Try changing one of the assets.`
}

const MoneroOutOfDateError = ({ payload = {} }: { payload: any }) => {
  const ticker = payload.fromAsset.displayTicker
  return `Your ${ticker} balance may not be up to date because it's not synced with the blockchain.`
}

const HighPriceImpactError = ({ payload = {} }: { payload: any }) => {
  const spreadPercentage = payload.spreadPercentage.toFixed(2)
  return `You'll receive a low amount. The price impact is ${spreadPercentage}%`
}

const Warning = () => {
  return 'Warning: TODO'
}

const ERROR_COMPONENTS = {
  MUST_OPT_IN: MustOptInError,
  LOW_ALGORAND_BALANCE: LowAlgorandError,
  LOW_SOL_RENT_EXEMPT_AMOUNT: LowSolanaRentExemptAmount,
  ZERO_BALANCE: ZeroBalanceError,
  NOT_ENOUGH_BALANCE: NotEnoughBalanceError,
  EXACT_OUT_QUOTE: ExactOutQuoteError,
  LOW_FROM_AMOUNT: LowFromAmountError,
  HIGH_FROM_AMOUNT: HighFromAmountError,
  NOT_ENOUGH_FEE_BALANCE: NotEnoughFeeBalanceError,
  PAIR_UNAVAILABLE: PairUnavailableError,
  MONERO_OUT_OF_DATE: MoneroOutOfDateError,
  HIGH_PRICE_IMPACT: HighPriceImpactError,
  WARNING: Warning,
}

const ErrorComponent = ({ type, reason, payload }) => {
  const ErrorComponent = ERROR_COMPONENTS[reason]

  return (
    <div className="mx-6 rounded-2xl bg-white/10 p-4 text-center text-sm">
      <ErrorComponent type={type} payload={payload} />
    </div>
  )
}

export default ErrorComponent
