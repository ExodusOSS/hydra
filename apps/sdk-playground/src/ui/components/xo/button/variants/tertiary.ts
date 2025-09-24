import { tw } from '@/ui/utils/classnames'

const styles = {
  base: tw`rounded-full text-current before:transition-opacity`,
  states: tw`hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)] hover:before:opacity-[6%] focus-visible:shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)] focus-visible:before:opacity-[6%] hover:dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] focus-visible:dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]`,
  // Color-overridable background needs a pseudo element to handle opacity:
  backgroundPseudoElement: tw`before:pointer-events-none before:absolute before:inset-0 before:z-0 before:rounded-full before:bg-current before:opacity-4`,
  // Border needs to be added in a pseudo element to preserve dimensions:
  borderPseudoElement: tw`after:absolute after:inset-0 after:z-[1] after:rounded-full after:bg-gradient-to-b after:from-current after:to-transparent after:to-[124%] after:p-[2px] after:opacity-8 after:[mask:linear-gradient(white_0_0)_content-box_exclude,linear-gradient(white_0_0)]`,
}

export const tertiary = {
  states: styles.states,
  wrapper: [styles.base, styles.backgroundPseudoElement, styles.borderPseudoElement],
}
