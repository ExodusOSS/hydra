import type { IconProps } from '../types.js'

export type ArrowLeftIconProps = Omit<IconProps, 'name'>

const ArrowLeftIcon = ({ className, size = 24 }: ArrowLeftIconProps) => {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 476.213 476.213">
      <polygon
        points="476.213,223.107 57.427,223.107 151.82,128.713 130.607,107.5 0,238.106 130.607,368.714 151.82,347.5
	57.427,253.107 476.213,253.107 "
      />
    </svg>
  )
}

export default ArrowLeftIcon
