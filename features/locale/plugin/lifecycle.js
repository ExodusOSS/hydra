import { createAtomObserver } from '@exodus/atoms'

const createLocalePlugin = ({
  languageAtom,
  languageFusionAtom,
  port,
  currencyAtom,
  currencyFusionAtom,
}) => {
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

  let unsubscribeFromLanguageFusionAtom
  let unsubscribeFromCurrencyFusionAtom

  const onStart = () => {
    languageAtomObserver.register()
    currencyAtomObserver.register()
    unsubscribeFromLanguageFusionAtom = languageFusionAtom.observe(async (fusionValue) => {
      // languageFusionAtom doesn't have `defaultValue`, because it may overwrite non default local value
      // hence fusion's private.language would be undefined when first observing before migration occurs
      if (fusionValue) {
        const languageAtomValue = await languageAtom.get()

        if (languageAtomValue !== fusionValue) {
          await languageAtom.set(fusionValue)
        }
      }
    })
    unsubscribeFromCurrencyFusionAtom = currencyFusionAtom.observe(async (fusionValue) => {
      if (fusionValue) {
        const currencyAtomValue = await currencyAtom.get()

        if (currencyAtomValue !== fusionValue) {
          await currencyAtom.set(fusionValue)
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
    unsubscribeFromLanguageFusionAtom?.()
    unsubscribeFromCurrencyFusionAtom?.()
  }

  const onClear = async () => {
    await languageAtom.set(undefined)
    await currencyAtom.set(undefined)
  }

  return { onClear, onLoad, onStop, onStart }
}

export default createLocalePlugin
