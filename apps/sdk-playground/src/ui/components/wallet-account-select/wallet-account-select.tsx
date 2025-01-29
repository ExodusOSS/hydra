import { cn } from '@/ui/utils/classnames'

import SelectInput from '../select/index.js'
import { useSelector } from 'react-redux'
import selectors from '@/ui/flux/selectors.js'

interface WalletAccountSelectProps {
  value: string
  required?: boolean
  className?: string
  onChange: (value: string) => void
}

function WalletAccountSelect({ value, required, className, onChange }: WalletAccountSelectProps) {
  const walletAccounts: string[] = useSelector(selectors.walletAccounts.enabled)
  const getWalletAccount: (name: string) => any = useSelector(selectors.walletAccounts.get)

  const options = walletAccounts.map((value) => {
    const instance = getWalletAccount(value)
    const label = instance ? `${instance.label} (${value})` : value
    return { value, label }
  })

  const selectedOption = options.find((option) => option.value === value) || null

  return (
    <SelectInput
      value={selectedOption}
      placeholder="Select wallet account"
      className={cn('w-full', className)}
      options={options}
      required={required}
      onChange={onChange}
    />
  )
}

export default WalletAccountSelect
