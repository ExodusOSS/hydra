import { cn } from '@/ui/utils/classnames'

import SelectInput from '../select/index.js'
import { useSelector } from 'react-redux'
import selectors from '@/ui/flux/selectors.js'

interface AssetSelectProps {
  value: string
  required?: boolean
  className?: string
  onChange: (value: string) => void
}

function AssetSelect({ value, required, className, onChange }: AssetSelectProps) {
  const assets: any[] = useSelector(selectors.assets.all)

  const options = Object.values(assets)
    .sort((a, b) => a.displayName.localeCompare(b.displayName))
    .map((asset) => {
      return { value: asset.name, label: asset.displayName }
    })

  const selectedOption = options.find((option) => option.value === value) || null

  return (
    <SelectInput
      value={selectedOption}
      placeholder="Select asset"
      className={cn('w-full', className)}
      options={options}
      required={required}
      onChange={onChange}
    />
  )
}

export default AssetSelect
