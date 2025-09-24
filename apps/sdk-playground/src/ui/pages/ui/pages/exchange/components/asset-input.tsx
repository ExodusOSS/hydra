import type { Asset } from '@exodus/exchange-ui'

type AssetInputProps = {
  asset: Asset
  loading: boolean
  disabled: boolean
  onBlur: () => void
  onChangeText: (value: string) => void
  onFocus: () => void
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
  return (
    <input
      className="w-full border-0 bg-transparent px-0 text-right text-2xl ring-0 focus:ring-0 disabled:opacity-30"
      value={value || ''}
      placeholder={placeholder}
      style={{ color: asset.primaryColor }}
      disabled={loading}
      onChange={(e) => onChangeText(e.target.value)}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  )
}

export default AssetInput
