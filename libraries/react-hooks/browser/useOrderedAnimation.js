import { useEffect } from 'react'

const TRANSITION_DURATION = 320

const SLIDE_IN_FROM_BOTTOM = [
  { opacity: 0, pointerEvents: 'none', transform: 'translateY(120px)' },
  { opacity: 1, pointerEvents: 'all', transform: 'translateY(0px)' },
]

const FORWARD_EASE_ANIMATION = (multiplier) => {
  return {
    delay: TRANSITION_DURATION,
    duration: multiplier ? TRANSITION_DURATION * multiplier : TRANSITION_DURATION,
    fill: 'forwards',
    easing: 'ease',
  }
}

const useOrderedAnimation = ({
  ref,
  order,
  animation = SLIDE_IN_FROM_BOTTOM,
  animationTimingFunction = FORWARD_EASE_ANIMATION,
}) => {
  useEffect(
    () => {
      ref.current?.animate(animation, animationTimingFunction(order))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [animation, animationTimingFunction, order, ref.current]
  )
}

export default useOrderedAnimation
