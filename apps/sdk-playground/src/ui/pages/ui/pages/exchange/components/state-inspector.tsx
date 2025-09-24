import JsonTree from '@/ui/components/json-tree'
import NumberUnit from '@exodus/currency'
import * as atoms from '@exodus/exchange-ui'
import { loadable, useAtomValue } from '@exodus/headless-ui'
import { WalletAccount } from '@exodus/models'

const handlePostprocessValue = (value: any) => {
  if (value instanceof NumberUnit) {
    return `${value.toDefaultString({ unit: true })} (NumberUnit)`
  }

  if (value instanceof WalletAccount) {
    return `${value.toString()} (WalletAccount)`
  }

  return value
}

const StateInspector = () => {
  const swapMode = useAtomValue(atoms.swapModeAtom)
  const fromAsset = useAtomValue(atoms.fromAssetAtom)
  const fromAssets = useAtomValue(atoms.fromAssetsAtom)
  const fromAmount = useAtomValue(atoms.fromAmountAtom)
  const fromFiatAmount = useAtomValue(atoms.fromFiatAmountAtom)
  const fromWalletAccount = useAtomValue(atoms.fromWalletAccountAtom)
  const toAsset = useAtomValue(atoms.toAssetAtom)
  const toAssets = useAtomValue(loadable(atoms.toAssetsAtom))
  const toAmount = useAtomValue(atoms.toAmountAtom)
  const toFiatAmount = useAtomValue(atoms.toFiatAmountAtom)
  const toWalletAccount = useAtomValue(atoms.toWalletAccountAtom)
  const spread = useAtomValue(atoms.spreadAtom)
  const prefillId = useAtomValue(atoms.prefillIdAtom)
  const config = useAtomValue(atoms.configAtom)
  const prefills = useAtomValue(loadable(atoms.prefillsAtom))
  const lastKnownPrefills = useAtomValue(atoms.lastKnownPrefillsAtom)
  const limits = useAtomValue(loadable(atoms.limitsAtom))
  const feeAmount = useAtomValue(atoms.feeAmountAtom)
  const feeFiatAmount = useAtomValue(atoms.feeFiatAmountAtom)
  const quote = useAtomValue(loadable(atoms.quoteAtom))
  const minQuote = useAtomValue(loadable(atoms.minQuoteAtom))
  const maxQuote = useAtomValue(loadable(atoms.maxQuoteAtom))
  const fromTotalBalance = useAtomValue(atoms.fromTotalBalanceAtom)

  return (
    <div className="flex-1">
      <div>State</div>
      <JsonTree
        postprocessValue={handlePostprocessValue}
        data={{
          swapMode,
          fromAssets,
          toAssets,
          fromAsset: fromAsset.name,
          fromAmount,
          fromFiatAmount,
          fromWalletAccount,
          toAsset: toAsset.name,
          toAmount,
          toFiatAmount,
          toWalletAccount,
          quote,
          minQuote,
          maxQuote,
          spread,
          prefillId,
          prefills,
          lastKnownPrefills,
          limits,
          feeAmount,
          feeFiatAmount,
          fromTotalBalance,
          config,
        }}
      />
    </div>
  )
}

export default StateInspector
