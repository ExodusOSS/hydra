import Button from '../button/index.js'
import Text from '../text/index.js'

function SeedModal({ visible, onCancel, onConfirm }) {
  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all">
      <div className="flex w-80 flex-col gap-4 rounded-lg border border-deep-50 bg-deep-400 p-6 shadow-lg">
        <Text size={20}>Use default seed?</Text>

        <div className="flex justify-end space-x-4">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>

          <Button onClick={onConfirm}>Confirm</Button>
        </div>
      </div>
    </div>
  )
}

export default SeedModal
