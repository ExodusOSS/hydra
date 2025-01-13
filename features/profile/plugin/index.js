import { createAtomObserver } from '@exodus/atoms'

const profilePlugin = ({ fusionProfileAtom, profileAtom, port }) => {
  const profileAtomObserver = createAtomObserver({
    port,
    atom: profileAtom,
    event: 'profile',
  })

  let unsubscribe

  const onStart = () => {
    unsubscribe = fusionProfileAtom.observe((profile) => profileAtom.set(profile))
  }

  const onLoad = () => {
    profileAtomObserver.start()
  }

  const onClear = async () => {
    await profileAtom.set(undefined)
  }

  const onStop = () => {
    profileAtomObserver.unregister()
    unsubscribe?.()
  }

  return { onStart, onLoad, onClear, onStop }
}

const profileLifecyclePluginDefinition = {
  id: 'profileLifecyclePlugin',
  type: 'plugin',
  factory: profilePlugin,
  dependencies: ['fusionProfileAtom', 'profileAtom', 'port'],
  public: true,
}

export default profileLifecyclePluginDefinition
