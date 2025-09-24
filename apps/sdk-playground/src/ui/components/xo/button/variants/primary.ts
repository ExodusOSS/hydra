import { tw } from '@/ui/utils/classnames'

const styles = {
  base: tw`rounded-full bg-[linear-gradient(169deg,#5C6CF6,#A371F4_53%),linear-gradient(0deg,#fff,#A371F4_67%,#DA9EFF)] bg-[length:160%_160%] text-white transition-[background-position] duration-300 ease-in-out`,
  states: tw`hover:bg-bottom focus-visible:border-none focus-visible:bg-bottom focus-visible:after:border-black/12`,
  // Border needs to be added in a pseudo element to preserve dimensions:
  borderPseudoElement: tw`after:pointer-events-none after:absolute after:inset-0 after:z-[1] after:rounded-full after:border after:border-transparent after:transition-colors`,
}

export const primary = {
  states: styles.states,
  wrapper: [styles.base, styles.borderPseudoElement],
}
