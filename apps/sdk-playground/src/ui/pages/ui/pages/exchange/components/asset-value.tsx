type AssetValueProps = {
  formattedValue: string
  loading: boolean
  onPress?: () => void
}

const AssetValue: React.FC<AssetValueProps> = ({ formattedValue, loading, onPress }) => {
  if (loading) {
    return <div className="h-4 w-10 self-end rounded-md bg-black/20" />
  }

  return (
    <button className="text-right text-xs text-white" onClick={() => onPress?.()}>
      {formattedValue}
    </button>
  )
}

export default AssetValue
