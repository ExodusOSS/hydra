import { cn, tw } from '@/ui/utils/classnames'

export const inputClassNames = cn(
  tw`mx-12 h-12 rounded-xl border border-transparent bg-white/10 px-3 py-1 text-center text-base leading-none outline-none transition-colors placeholder:text-white/50 placeholder:transition-colors sm:mx-0`,
  tw`focus:border-white/32 focus:ring-0 focus:!ring-white focus:ring-opacity-0 focus:!ring-offset-white/8 focus:placeholder:text-white/24`
)

export const inputErrorClassNames = cn(tw`border-red-500`)
