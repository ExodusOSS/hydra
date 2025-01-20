import type { IconProps } from '../types.js'

export type ChevronDownIconProps = Omit<IconProps, 'name'>

const ChevronDownIcon = ({ className, size = 24 }: ChevronDownIconProps) => {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 386.257 386.257">
      <polygon points="0,96.879 193.129,289.379 386.257,96.879 " />
    </svg>
  )
}

export default ChevronDownIcon
