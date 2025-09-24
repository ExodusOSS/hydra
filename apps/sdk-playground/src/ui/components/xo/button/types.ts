import type { ButtonHTMLAttributes, ComponentType, ReactNode } from 'react'

export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary'

export type ButtonConditionalWrapperProps = {
  children?: ReactNode
  className?: string
  href?: string
  onClick?: () => void
  role?: 'menuitem'
  target?: '_blank' | '_self'
}

export type ButtonWrapperProps = {
  children: ReactNode
  className?: string
  disabled?: boolean
  href?: string
  onClick?: () => void
  role?: 'menuitem' | 'button' | 'link'
  target?: '_blank' | '_self'
}

export type ButtonIconWrapperProps = {
  children: ReactNode
  className?: string
}

export type ButtonInnerTextProps = {
  children: ReactNode
  className?: string
  size?: ButtonSize
}

export type ButtonProps = ButtonWrapperProps &
  Omit<ButtonInnerTextProps, 'children'> & {
    size?: ButtonSize
    textClassName?: string
    variant?: ButtonVariant
    IconLeft?: {
      wrapperClassName?: string
      Component: ComponentType<any>
    }
    IconRight?: {
      wrapperClassName?: string
      Component: ComponentType<any>
    }
  } & ButtonHTMLAttributes<HTMLButtonElement>

export type TrackDownloadLinkOptions = {
  utmSource?: string
  utmContent?: string
  utmCampaign?: string
}
