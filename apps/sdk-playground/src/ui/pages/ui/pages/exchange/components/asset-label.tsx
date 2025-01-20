import type NumberUnit from '@exodus/currency'
import type { Asset, Side } from '@exodus/exchange-ui'
import { formatAssetAmount } from '@exodus/formatting/lib/asset'

const getBalanceLabel = ({ side, asset, customTokenBeingAdded, balance }) => {
  const isTo = side === 'to'
  return (
    <>
      {isTo ? 'I want' : `I have ${balance}`}{' '}
      {isTo ? (customTokenBeingAdded || asset).displayName : ''}
    </>
  )
}

type AssetLabelProps = {
  asset: Asset
  balance?: NumberUnit
  className?: string
  side: Side
  style?: React.CSSProperties
}

export const FromAssetLabel: React.FC<AssetLabelProps & { balance: NumberUnit }> = ({
  asset,
  balance,
  side,
}) => {
  return (
    <div>
      {getBalanceLabel({
        side,
        asset,
        customTokenBeingAdded: false,
        balance: `${formatAssetAmount(balance)} ${asset.displayName}`,
      })}
    </div>
  )
}

export const ToAssetLabel: React.FC<AssetLabelProps> = ({ asset, side }) => {
  return (
    <div>
      {getBalanceLabel({
        side,
        asset,
        customTokenBeingAdded: false,
        balance: '',
      })}
    </div>
  )
}
