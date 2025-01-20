import type { Asset } from '@exodus/exchange-ui'

type AssetInputProps = {
  asset: Asset
  loading?: boolean
  onBlur?: () => void
  onChangeText: (value: string) => void
  onFocus?: () => void
  placeholder: string
  value?: string
}

const AssetInput: React.FC<AssetInputProps> = ({
  asset,
  loading,
  onBlur,
  onChangeText,
  onFocus,
  placeholder,
  value,
}) => {
  if (loading) {
    return <div className="mt-1 h-8 w-28 self-end rounded-md bg-black/20" />
  }

  return (
    <input
      className="w-full bg-transparent text-right text-2xl outline-none"
      value={value || ''}
      placeholder={placeholder}
      style={{ color: asset.primaryColor }}
      onChange={(e) => onChangeText(e.target.value)}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  )
}

export default AssetInput
