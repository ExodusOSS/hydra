import selectors from '@/ui/flux/selectors'
import { ExchangeForm } from '@exodus/exchange-ui'
import { useSelector } from 'react-redux'

import Asset from './components/asset.js'
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
import Modal from './components/modal.js'
import StateInspector from './components/state-inspector.js'
import { FromAssetLabel, ToAssetLabel } from './components/asset-label.js'

const ExchangeUI = () => {
  const [currentModal, showModal] = useModal()

  const isLocked = useSelector(selectors.application.isLocked)
  const walletAccounts: string[] = useSelector(selectors.walletAccounts.enabled)

  if (isLocked) return null

  const handleAssetClick = async ({ side, assets }) => {
    const options = assets.map((value) => ({ value, label: value.displayName }))
    const title = side === 'from' ? 'From Asset' : 'To Asset'
    return showModal({ title, options })
  }

  const handleWalletAccountClick = async () => {
    const options = walletAccounts.map((value) => ({ value, label: value }))
    return showModal({ title: 'Wallet Accounts', options })
  }

  return (
    <div className="flex">
      <ExchangeForm>
        <div className="relative flex h-[650px] w-[360px] flex-col rounded-lg bg-[#282a44] text-white">
          <div className="pb-10 pt-8">
            <div className="w-full text-center text-sm uppercase text-white/50">Swap</div>
            <ExchangeForm.ResetButton Component={ResetButton} />
          </div>

          <div className="flex pr-6">
            <ExchangeForm.FromWalletAccount
              Component={WalletAccount}
              onPress={handleWalletAccountClick}
            />
            <div className="flex flex-col">
              <ExchangeForm.FromAssetLabel Component={FromAssetLabel} />
              <ExchangeForm.FromAsset Component={Asset} onPress={handleAssetClick} />
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
              onPress={handleWalletAccountClick}
            />
            <div className="flex flex-col">
              <ExchangeForm.ToAssetLabel Component={ToAssetLabel} />
              <ExchangeForm.ToAsset Component={Asset} onPress={handleAssetClick} />
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

          <Modal {...currentModal} />
        </div>

        <StateInspector />
      </ExchangeForm>
    </div>
  )
}

export default ExchangeUI
