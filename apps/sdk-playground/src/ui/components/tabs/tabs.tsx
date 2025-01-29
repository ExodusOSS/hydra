import { cn } from '@/ui/utils/classnames'

interface Option {
  id: string
  label: string
}

interface TabsProps {
  options: Option[]
  active: string
  className?: string
  onChange: (id: string) => void
}

function Tabs({ options, active, className, onChange }: TabsProps) {
  return (
    <div className={cn('flex w-full flex-row gap-5 border-b border-b-deep-50', className)}>
      {options.map((option) => (
        <button
          key={option.id}
          className={`relative px-4 py-3 text-base font-normal ${
            active === option.id
              ? 'before:absolute before:bottom-0 before:left-0 before:h-[2px] before:w-full before:bg-blue-500'
              : ''
          }`}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default Tabs
