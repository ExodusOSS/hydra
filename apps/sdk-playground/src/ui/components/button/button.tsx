import { Button as XoButton } from '@/ui/components/xo/button'
import type { ButtonProps as XoButtonProps } from '@/ui/components/xo/button/types'

const Button = ({ variant = 'primary', ...props }: XoButtonProps) => {
  return <XoButton variant={variant} {...props} />
}

export default Button
