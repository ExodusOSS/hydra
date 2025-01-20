import Icon from '@/ui/components/icon'
import { cn } from '@/ui/utils/classnames'
import type { Asset } from '@exodus/exchange-ui'
import type { MouseEventHandler } from 'react'

type FromAssetProps = {
  asset: Asset
  loading: boolean
  onPress?: MouseEventHandler<HTMLButtonElement>
}

const FromAsset: React.FC<FromAssetProps> = ({ asset, loading, onPress }) => {
  return (
    <button
      className={cn('flex flex-col', loading && 'pointer-events-none opacity-40')}
      onClick={onPress}
    >
      <div className="flex items-center">
        <div className="mr-2 text-2xl">{asset.ticker}</div>
        <Icon className="fill-white/20" name="chevron-down" size={12} />
      </div>
    </button>
  )
}

export default FromAsset
