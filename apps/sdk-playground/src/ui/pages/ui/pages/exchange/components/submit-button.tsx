type SubmitButtonProps = {
  loading: boolean
  disabled: boolean
  visible: boolean
  onPress: () => Promise<void>
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ loading, disabled, visible, onPress }) => {
  if (!visible || disabled || loading) return null

  return (
    <button
      className="absolute bottom-6 left-4 right-4 mx-4 rounded-2xl bg-[#720eff] p-3"
      type="button"
      style={{ display: 'block' }}
      onClick={onPress}
    >
      Swap
    </button>
  )
}

export default SubmitButton
