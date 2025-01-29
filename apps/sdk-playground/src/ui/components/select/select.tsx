import Select from 'react-select'

import { cn } from '@/ui/utils/classnames'

interface Option {
  value: string
  label: string
}

interface SelectInputProps {
  value: Option | null
  required?: boolean
  placeholder?: string
  options: Option[]
  className?: string
  onChange?: (value: string) => void
}

function SelectInput({
  value,
  options,
  required,
  placeholder,
  className,
  onChange,
}: SelectInputProps) {
  return (
    <Select
      value={value}
      required={required}
      placeholder={placeholder}
      className={cn('w-full', className)}
      classNames={{
        input: () => '[&>input]:!outline-none [&>input]:!ring-0',
        singleValue: () => '!text-slate-300 !text-sm',
        placeholder: () => '!text-slate-600 !text-thin !text-sm',
        control: () => '!bg-deep-300 !border-none !rounded !ring-0',
        indicatorSeparator: () => '!bg-deep-50 parent:!text-deep-50',
        menu: () => '!bg-deep-300 !border !border-deep-50 !rounded',
        noOptionsMessage: () => '!text-slate-600 !text-sm',
        menuList: () => '!border-none !p-0',
        option: ({ isSelected }) =>
          cn('!text-sm !bg-deep-300 !cursor-pointer', isSelected && '!bg-deep-50'),
      }}
      options={options}
      onChange={(option) => onChange?.(option.value)}
    />
  )
}

export default SelectInput
