import { cn, tw } from '@/ui/utils/classnames'

import type { ButtonProps, ButtonSize, ButtonVariant } from './types'
import { primary } from './variants/primary'
import { secondary } from './variants/secondary'
import { tertiary } from './variants/tertiary'

const disabledClassName = tw`cursor-not-allowed opacity-64`

const resetUserAgentClassName = tw`relative text-center no-underline focus:outline-none focus:ring-transparent`

const fixedSizes: Record<
  Extract<ButtonSize, 'sm' | 'md' | 'lg'>,
  { text: string; wrapper: string }
> = {
  sm: {
    text: tw`text-xs`, // 12px
    wrapper: tw`min-h-8 gap-x-2 px-5 py-2`,
  },
  md: {
    text: tw`text-sm`, // 14px
    wrapper: tw`min-h-10 gap-x-2.5 px-5 py-2`,
  },
  lg: {
    text: tw`text-base`, // 16px
    wrapper: tw`min-h-12 gap-x-3 px-8 py-2`,
  },
}

// Most button sizes are not scaled on mobile, but only `xl` is scaled to `lg` size on mobile.
const responsiveSizes: Record<Extract<ButtonSize, 'xl'>, { text: string; wrapper: string }> = {
  xl: {
    text: cn(fixedSizes.lg.text, tw`md:text-lg`), // 18px
    wrapper: cn(fixedSizes.lg.wrapper, tw`md:min-h-14 md:gap-x-3 md:px-8 md:py-2`),
  },
}

/**
 * Button sizes:
 * - sm: 32px height
 * - md: 40px height
 * - lg: 48px height
 * - xl: 56px height
 */
const sizes: Record<ButtonSize, { text: string; wrapper: string }> = {
  ...fixedSizes,
  ...responsiveSizes,
}

const variants: Record<ButtonVariant, { states: string | string[]; wrapper: string[] }> = {
  primary,
  secondary,
  tertiary,
}

export function getTextSizeClassName(size: ButtonProps['size'] = 'md') {
  return sizes[size].text
}

export function getSizeClassName({ size = 'md' }: Pick<ButtonProps, 'size'>) {
  const { wrapper } = sizes[size]

  return {
    wrapper,
  }
}

// Specific styles for each button variant.
export function getVariantClassName({
  variant = 'primary',
  disabled,
}: Pick<ButtonProps, 'variant' | 'disabled'>) {
  const { states, wrapper } = variants[variant]

  return {
    wrapper: [resetUserAgentClassName, wrapper, disabled ? disabledClassName : states],
  }
}
