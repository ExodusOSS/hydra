import { FaCopy } from '../deps/react-icons-fa6'

import type { IconProps } from '../types.js'

export type CopyIconProps = Omit<IconProps, 'name'>

const CopyIcon = ({ className, size = 24 }: CopyIconProps) => {
  return <FaCopy className={className} size={size} />
}

export default CopyIcon
