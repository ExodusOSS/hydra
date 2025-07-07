import { createAtomObserver } from '@exodus/atoms'

const createLocalePlugin = ({ languageAtom, languageFusionAtom, port, currencyAtom }) => {
  const languageAtomObserver = createAtomObserver({
    port,
    atom: languageAtom,
    event: 'language',
  })

  const currencyAtomObserver = createAtomObserver({
    port,
    atom: currencyAtom,
    event: 'currency',
  })

  let unsubscribeFromFusionAtom

  const onStart = () => {
    languageAtomObserver.register()
    currencyAtomObserver.register()
    unsubscribeFromFusionAtom = languageFusionAtom.observe(async (fusionValue) => {
      // languageFusionAtom doesn't have `defaultValue`, because it may overwrite non default local value
      // hence fusion's private.language would be undefined when first observing before migration occurs
      if (fusionValue) {
        const languageAtomValue = await languageAtom.get()

        if (languageAtomValue !== fusionValue) {
          await languageAtom.set(fusionValue)
        }
      }
    })
  }

  const onLoad = () => {
    languageAtomObserver.start()
    currencyAtomObserver.start()
  }

  const onStop = () => {
    languageAtomObserver.unregister()
    currencyAtomObserver.unregister()
    unsubscribeFromFusionAtom?.()
  }

  const onClear = async () => {
    await languageAtom.set(undefined)
  }

  return { onClear, onLoad, onStop, onStart }
}

export default createLocalePlugin
