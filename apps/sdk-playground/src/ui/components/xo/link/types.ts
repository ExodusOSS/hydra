import type { ReactNode } from 'react'

export type LinkProps = {
  href?: string
  className?: string
  children: ReactNode
  target?: '_blank' | '_self'
  rel?: string
}
