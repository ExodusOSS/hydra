import { FaGithub } from 'react-icons/fa6'

import type { IconProps } from '../types.js'

export type GithubIconProps = Omit<IconProps, 'name'>

const GithubIcon = ({ className, size = 24 }: GithubIconProps) => {
  return <FaGithub className={className} size={size} />
}

export default GithubIcon
