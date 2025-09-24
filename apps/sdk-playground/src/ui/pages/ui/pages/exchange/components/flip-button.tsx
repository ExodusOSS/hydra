import React from 'react'
import Icon from '@/ui/components/icon'
import { cn } from '@/ui/utils/classnames'

type FlipButtonProps = {
  className?: string
  disabled: boolean
  style?: React.CSSProperties
  onPress?: () => Promise<void>
}

const FlipButton: React.FC<FlipButtonProps> = ({ className, style, onPress }) => {
  return (
    <div className={cn('mx-6 my-5 flex items-center', className)} style={style}>
      <div className="h-[1px] flex-1 border border-white/10" />
      <button
        className="ml-6 flex h-[50px] w-[50px] items-center justify-center rounded-full bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
        type="button"
        onClick={onPress}
      >
        <Icon className="fill-white" name="flip" size={24} />
      </button>
    </div>
  )
}

export default FlipButton
