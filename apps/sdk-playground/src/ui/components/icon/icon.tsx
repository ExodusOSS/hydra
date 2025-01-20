import type { IconProps } from './types.js'
import variants from './variants/index.js'

function Icon({ name, className, ...other }: IconProps) {
  if (!(name in variants)) {
    console.warn(`Icon: Unknown icon name: '${String(name)}'`)
    return null
  }

  const Component = variants[name]

  return <Component className={className} {...other} />
}

export default Icon
