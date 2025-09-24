type AssetValueProps = {
  formattedValue: string
  loading: boolean
  onPress?: () => void
}

const AssetValue: React.FC<AssetValueProps> = ({ formattedValue, loading, onPress }) => {
  return (
    <button
      className="text-right text-xs text-white disabled:opacity-30"
      disabled={loading}
      onClick={() => onPress?.()}
    >
      {formattedValue}
    </button>
  )
}

export default AssetValue
