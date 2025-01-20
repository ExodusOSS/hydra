import { cn, tw } from '@/ui/utils/classnames'

export interface TextProps {
  children: React.ReactNode
  className?: string
  align?: 'left' | 'center' | 'right'
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  size?: 12 | 13 | 14 | 16 | 18 | 24
}

const sizeStyles = {
  12: tw`text-xs`,
  13: tw`text-[0.8125rem] leading-[1.125rem]`,
  14: tw`text-sm`,
  16: tw`text-base`,
  18: tw`text-lg`,
  24: tw`text-2xl`,
}

const alignStyles = {
  left: tw`text-left`,
  center: tw`text-center`,
  right: tw`text-right`,
}

function Text({ children, className, align = 'left', as: Component = 'p', size = 16 }: TextProps) {
  return (
    <Component className={cn('font-normal', sizeStyles[size], alignStyles[align], className)}>
      {children}
    </Component>
  )
}

export default Text
