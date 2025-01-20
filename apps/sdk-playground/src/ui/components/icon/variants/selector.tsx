import type { IconProps } from '../types.js'

export type SelectorIconProps = Omit<IconProps, 'name'>

const SelectorIcon = ({ className, size = 24 }: SelectorIconProps) => {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M8.976 21C4.05476 21 3 19.9452 3 15.024"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M21 15.024C21 19.9452 19.9452 21 15.024 21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M15.024 3C19.9452 3 21 4.05476 21 8.976"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M3 8.976C3 4.05476 4.05476 3 8.976 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 9.5L12 14.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.5 12L9.5 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default SelectorIcon
