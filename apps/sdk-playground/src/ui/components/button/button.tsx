import { cn, tw } from '@/ui/utils/classnames'

const variantStyles = {
  primary: tw`bg-blue-500`,
  secondary: tw`bg-slate-700`,
  transparent: tw`bg-transparent p-0`,
}

interface ButtonProps {
  className?: string
  type?: 'button' | 'submit' | 'reset'
  variant?: keyof typeof variantStyles
  children: React.ReactNode
  onClick?: (e: any) => void | Promise<void>
}

const Button = ({
  className,
  type = 'button',
  variant = 'primary',
  onClick,
  children,
}: ButtonProps) => {
  return (
    <button
      className={cn('rounded px-4 py-2 text-sm text-white', variantStyles[variant], className)}
      type={type}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default Button
