import { FaMagnifyingGlass } from '../deps/react-icons-fa6'

import type { IconProps } from '../types.js'

export type MagnifyingGlassIconProps = Omit<IconProps, 'name'>

const MagnifyingGlassIcon = ({ className, size = 24 }: MagnifyingGlassIconProps) => {
  return <FaMagnifyingGlass className={className} size={size} />
}

export default MagnifyingGlassIcon
