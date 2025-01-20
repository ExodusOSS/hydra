import Icon from '@/ui/components/icon'

type ResetButtonProps = {
  visible: boolean
  onPress: () => void
}

const ResetButton: React.FC<ResetButtonProps> = ({ visible, onPress }) => {
  if (!visible) return null

  return (
    <button
      className="absolute left-6 top-6"
      type="button"
      style={{ display: 'block' }}
      onClick={onPress}
    >
      <Icon className="fill-white" name="arrow-left" size={24} />
    </button>
  )
}

export default ResetButton
