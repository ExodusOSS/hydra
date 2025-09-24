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
        singleValue: () => '!text-foreground !text-sm',
        placeholder: () => '!text-muted-foreground !text-thin !text-sm',
        control: () => '!bg-background !border-none !rounded !ring-0',
        indicatorSeparator: () => '!bg-border parent:!text-border',
        menu: () => '!bg-background !border !border-border !rounded',
        noOptionsMessage: () => '!text-muted-foreground !text-sm',
        menuList: () => '!border-none !p-0',
        option: ({ isSelected }) =>
          cn('!text-sm !bg-background !cursor-pointer', isSelected && '!bg-accent'),
      }}
      options={options}
      onChange={(option) => onChange?.(option.value)}
    />
  )
}

export default SelectInput
