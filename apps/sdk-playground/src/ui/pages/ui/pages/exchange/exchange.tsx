import selectors from '@/ui/flux/selectors'
import type { Asset } from '@exodus/exchange-ui'
import { ExchangeForm } from '@exodus/exchange-ui'
import { useSelector } from 'react-redux'

import { FromAsset, ToAsset } from './components/asset.js'
import AssetInput from './components/asset-input.js'
import AssetValue from './components/asset-value.js'
import FeeDetails from './components/fee-details.js'
import ResetButton from './components/reset-button.js'
import PercentageSwitch from './components/percentage-switch.js'
import FlipButton from './components/flip-button.js'
import ErrorComponent from './components/error.js'
import WalletAccount from './components/wallet-account.js'
import SubmitButton from './components/submit-button.js'
import useModal from './hooks/use-modal.js'
import StateInspector from './components/state-inspector.js'
import Actions from './components/actions.js'
import SelectAsset from './components/select-asset.js'
import SelectWalletAccount from './components/select-wallet-account.js'
import { FromAssetLabel, ToAssetLabel } from './components/asset-label.js'

type AssetsModalParams = {
  key: string
  side: 'from' | 'to'
  assets: Asset[]
}

const ExchangeUI = () => {
  const [assetsModal, showAssetsModal] = useModal<AssetsModalParams>()
  const [walletAccountsModal, showWalletAccountsModal] = useModal()

  const isLocked = useSelector(selectors.application.isLocked)
  if (isLocked) return null

  const handleAssetClick = async ({ side, assets }) => {
    return showAssetsModal({ key: side, side, assets })
  }

  const handleWalletAccountSelect = async ({ walletAccount }) => {
    return walletAccountsModal?.onClick(walletAccount)
  }

  const handleAssetSelect = async (source) => {
    return assetsModal?.onClick(source)
  }

  return (
    <div className="flex gap-4">
      <ExchangeForm>
        <div className="relative flex h-[650px] w-[360px] flex-col rounded-lg bg-[#282a44] text-white">
          <div className="pb-10 pt-8">
            <div className="w-full text-center text-sm uppercase text-white/50">Swap</div>
            <ExchangeForm.ResetButton Component={ResetButton} />
          </div>

          <div className="flex pr-6">
            <ExchangeForm.FromWalletAccount
              Component={WalletAccount}
              onPress={showWalletAccountsModal}
            />
            <div className="flex flex-col">
              <ExchangeForm.FromAssetLabel Component={FromAssetLabel} />
              <ExchangeForm.FromAsset Component={FromAsset} onPress={handleAssetClick} />
            </div>

            <div className="flex flex-1 flex-col">
              <ExchangeForm.FromAssetValue Component={AssetValue} />
              <ExchangeForm.FromAssetInput Component={AssetInput} />
            </div>
          </div>

          <ExchangeForm.FlipButton Component={FlipButton} />

          <div className="flex pr-6">
            <ExchangeForm.ToWalletAccount
              Component={WalletAccount}
              onPress={showWalletAccountsModal}
            />
            <div className="flex flex-col">
              <ExchangeForm.ToAssetLabel Component={ToAssetLabel} />
              <ExchangeForm.ToAsset Component={ToAsset} onPress={handleAssetClick} />
            </div>

            <div className="flex flex-1 flex-col">
              <ExchangeForm.ToAssetValue Component={AssetValue} />
              <ExchangeForm.ToAssetInput Component={AssetInput} />
            </div>
          </div>

          <ExchangeForm.PercentageSwitch Component={PercentageSwitch} />
          <ExchangeForm.Error Component={ErrorComponent} />
          <ExchangeForm.FeeDetails Component={FeeDetails} />
          <ExchangeForm.SubmitButton Component={SubmitButton} />

          {assetsModal?.side === 'from' && (
            <ExchangeForm.FromSelect Component={SelectAsset} onSelect={handleAssetSelect} />
          )}

          {assetsModal?.side === 'to' && (
            <ExchangeForm.ToSelect Component={SelectAsset} onSelect={handleAssetSelect} />
          )}

          {walletAccountsModal?.side === 'from' && (
            <ExchangeForm.FromSelect
              Component={SelectWalletAccount}
              onSelect={handleWalletAccountSelect}
            />
          )}

          {walletAccountsModal?.side === 'to' && (
            <ExchangeForm.ToSelect
              Component={SelectWalletAccount}
              onSelect={handleWalletAccountSelect}
            />
          )}
        </div>
      </ExchangeForm>

      <div>
        <StateInspector />
        <Actions />
      </div>
    </div>
  )
}

export default ExchangeUI
