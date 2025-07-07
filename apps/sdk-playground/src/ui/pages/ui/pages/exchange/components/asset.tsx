import Icon from '@/ui/components/icon'
import { cn } from '@/ui/utils/classnames'
import type { Asset, ExchangeAsset } from '@exodus/exchange-ui'

interface BaseAssetProps {
  asset?: any
  loading: boolean
  onPress?: () => Promise<void>
}

const BaseAsset = ({ asset, loading, onPress }: BaseAssetProps) => {
  const ticker = asset ? ('ticker' in asset ? asset.ticker : asset.symbol) : ''

  return (
    <button
      className={cn('flex flex-col', loading && 'pointer-events-none opacity-40')}
      onClick={onPress}
    >
      <div className="flex items-center">
        <div className="mr-2 text-2xl">{ticker}</div>
        <Icon className="fill-white/20" name="chevron-down" size={12} />
      </div>
    </button>
  )
}

export const FromAsset: React.FC<BaseAssetProps & { asset: Asset }> = BaseAsset

export const ToAsset: React.FC<
  BaseAssetProps & {
    asset?: Asset | ExchangeAsset
  }
> = BaseAsset
