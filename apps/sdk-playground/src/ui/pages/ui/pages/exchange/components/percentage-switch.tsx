import { cn } from '@/ui/utils/classnames'
import React from 'react'

type PercentageSwitchProps = {
  value: string | null
  options: { id: string; label: string }[]
  loading: boolean
  onChange: (value: string) => void
}

const PercentageSwitch: React.FC<PercentageSwitchProps> = ({ value, options, onChange }) => {
  return (
    <div className="mx-8 my-6 flex h-[56px] rounded-3xl bg-[#1f2136] px-4 py-3">
      {options.map((option) => (
        <button
          type="button"
          className={cn(
            'flex-1 rounded-xl py-1 text-center',
            value === option.id && 'bg-[#8359ff]'
          )}
          key={option.id}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default PercentageSwitch
