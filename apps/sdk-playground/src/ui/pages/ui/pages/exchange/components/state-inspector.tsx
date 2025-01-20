import JsonTree from '@/ui/components/json-tree'
import { useFromAsset, useToAsset, useFromAmount, useToAmount, useQuote } from '@exodus/exchange-ui'

const StateInspector = () => {
  const [fromAsset] = useFromAsset()
  const [fromAmount] = useFromAmount()
  const [toAsset] = useToAsset()
  const [toAmount] = useToAmount()
  const quote = useQuote()

  return (
    <div className="ml-8 flex-1">
      <div>State</div>
      <JsonTree
        data={{ fromAsset: fromAsset.name, fromAmount, toAsset: toAsset.name, toAmount, quote }}
      />
    </div>
  )
}

export default StateInspector
