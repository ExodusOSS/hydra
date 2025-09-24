import { tw } from '@/ui/utils/classnames'

const styles = {
  base: tw`rounded-full border border-current transition-shadow`,
  states: tw`hover:before:opacity-24 focus-visible:before:opacity-24`,
  // Color-overridable shadow needs a pseudo element to handle opacity:
  shadowPseudoElement: tw`before:pointer-events-none before:absolute before:inset-0 before:z-0 before:rounded-full before:opacity-0 before:shadow-[0_6px_24px_currentColor] before:transition-opacity`,
}

export const secondary = {
  states: styles.states,
  wrapper: [styles.base, styles.shadowPseudoElement],
}
