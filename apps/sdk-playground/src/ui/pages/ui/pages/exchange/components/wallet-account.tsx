import type { WalletAccount as WalletAccountModel } from '@exodus/models'

import { cn } from '@/ui/utils/classnames'

const SIZES = {
  small: 14,
  medium: 35,
}

type WalletAccountProps = {
  walletAccount: WalletAccountModel
  className?: string
  active?: boolean
  size?: keyof typeof SIZES
  style?: React.CSSProperties
  onPress?: () => Promise<void>
}

const WalletAccount: React.FC<WalletAccountProps> = ({
  walletAccount,
  className,
  active,
  size = 'medium',
  onPress,
}) => {
  return (
    <button
      className={cn(className, 'mr-2 rounded-r-[40%] bg-[#212238]', active && 'ring-1 ring-white')}
      style={{ padding: SIZES[size] / 2 }}
      onClick={onPress}
    >
      <svg width={SIZES[size]} height={SIZES[size]} viewBox="0 0 24 24" fill={walletAccount.color}>
        <path d="M11.2346 1.31703C11.7247 1.11404 12.2753 1.11404 12.7654 1.31703L19.0128 3.9048C19.5029 4.10779 19.8922 4.49714 20.0952 4.98719L22.683 11.2346C22.886 11.7247 22.886 12.2753 22.683 12.7654L20.0952 19.0128C19.8922 19.5029 19.5029 19.8922 19.0128 20.0952L12.7654 22.683C12.2753 22.886 11.7247 22.886 11.2346 22.683L4.98719 20.0952C4.49714 19.8922 4.10779 19.5029 3.9048 19.0128L1.31703 12.7654C1.11404 12.2753 1.11404 11.7247 1.31703 11.2346L3.9048 4.98719C4.10779 4.49714 4.49714 4.10779 4.98719 3.9048L11.2346 1.31703Z" />
      </svg>
    </button>
  )
}

export default WalletAccount
