import { formatAssetAmount } from '@exodus/formatting/lib/asset'
import { formatPrice } from '@exodus/formatting/lib/price'

const FeeDetails = ({ value, visible, fiatMode, feeAsset, onFiatModePress }) => {
  if (!visible) return null

  const formattedValue = fiatMode
    ? formatPrice(value.toDefaultNumber(), { currency: value.currency })
    : `${formatAssetAmount(value)} ${feeAsset.displayTicker}`

  return (
    <button className="text-center text-xs text-white opacity-30" onClick={onFiatModePress}>
      Fees: {formattedValue}
    </button>
  )
}

export default FeeDetails
